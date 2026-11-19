import time
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Conversation, Message


class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.conversation_id = None
        self.room_group_name = None
        self.last_message_time = 0.0
        self.message_count_window = 0
        self.window_start_time = 0.0

    async def connect(self):
        self.user = self.scope.get('user')

        # 1. Reject unauthenticated users immediately before accepting
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # 2. Extract conversation ID from URL route
        raw_conv_id = self.scope.get('url_route', {}).get('kwargs', {}).get('conversation_id')
        try:
            self.conversation_id = int(raw_conv_id)
        except (TypeError, ValueError):
            await self.close(code=4000)
            return

        # 3. Check conversation membership
        is_member = await self._is_conversation_member(self.conversation_id, self.user.id)
        if not is_member:
            await self.close(code=4003)
            return

        # 4. Join group and accept connection
        self.room_group_name = f"chat_{self.conversation_id}"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        if not self.user or not self.user.is_authenticated:
            await self.send_json({'type': 'error', 'error': 'Unauthorized'})
            await self.close(code=4001)
            return

        # Basic rate limiting: maximum 5 messages per 2-second window
        now = time.time()
        if now - self.window_start_time > 2.0:
            self.window_start_time = now
            self.message_count_window = 1
        else:
            self.message_count_window += 1
            if self.message_count_window > 5:
                await self.send_json({
                    'type': 'error',
                    'error': 'Rate limit exceeded. Please wait a moment before sending more messages.'
                })
                return

        # Extract message text (accept either 'content' or 'message')
        text = content.get('content')
        if text is None:
            text = content.get('message')

        if not text or not isinstance(text, str):
            await self.send_json({
                'type': 'error',
                'error': 'Message content cannot be empty.'
            })
            return

        clean_text = text.strip()
        if not clean_text:
            await self.send_json({
                'type': 'error',
                'error': 'Message content cannot be empty.'
            })
            return

        if len(clean_text) > 2000:
            await self.send_json({
                'type': 'error',
                'error': 'Message exceeds maximum length of 2000 characters.'
            })
            return

        # Save message in PostgreSQL
        saved_msg = await self._save_message(self.conversation_id, self.user.id, clean_text)
        if not saved_msg:
            await self.send_json({
                'type': 'error',
                'error': 'Unable to save message. Conversation access denied or inactive.'
            })
            return

        # Broadcast the saved message to all participants in this conversation group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': saved_msg
            }
        )

    async def chat_message(self, event):
        """
        Handler for messages broadcasted to the conversation group.
        """
        await self.send_json({
            'type': 'chat_message',
            'message': event['message']
        })

    @database_sync_to_async
    def _is_conversation_member(self, conversation_id, user_id):
        try:
            conv = Conversation.objects.get(id=conversation_id)
            return conv.buyer_id == user_id or conv.seller_id == user_id
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def _save_message(self, conversation_id, user_id, content):
        try:
            conv = Conversation.objects.get(id=conversation_id)
            if conv.buyer_id != user_id and conv.seller_id != user_id:
                return None

            msg = Message.objects.create(
                conversation=conv,
                sender_id=user_id,
                content=content
            )
            conv.updated_at = timezone.now()
            conv.save(update_fields=['updated_at'])

            return {
                'id': msg.id,
                'conversation_id': conv.id,
                'sender_id': msg.sender_id,
                'sender_username': msg.sender.username,
                'content': msg.content,
                'is_read': msg.is_read,
                'created_at': msg.created_at.isoformat()
            }
        except Exception:
            return None
