import json
import time
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.core.signing import TimestampSigner
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from channels.testing import WebsocketCommunicator

from config.asgi import application
from chat.models import Conversation, Message

User = get_user_model()


class ChatRESTAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='user1@student.edu',
            username='student1',
            password='StrongPassword123!',
            mobile_number='9876543210'
        )
        self.user2 = User.objects.create_user(
            email='user2@student.edu',
            username='student2',
            password='StrongPassword123!',
            mobile_number='9876543211'
        )
        self.user3 = User.objects.create_user(
            email='user3@student.edu',
            username='student3',
            password='StrongPassword123!',
            mobile_number='9876543212'
        )

    def test_unauthenticated_user_cannot_create_or_list_conversations(self):
        # List
        res = self.client.get('/api/chat/conversations/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Create
        res = self.client.post('/api/chat/conversations/', {
            'other_user_id': self.user2.id
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_and_list_conversations(self):
        self.client.force_authenticate(user=self.user1)

        payload = {
            'other_user_id': self.user2.id,
            'listing_id': 101,
            'listing_title': 'Calculus 9th Ed',
            'listing_image': 'https://example.com/book.jpg'
        }
        res = self.client.post('/api/chat/conversations/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertEqual(data['other_user']['username'], 'student2')
        self.assertEqual(data['listing_id'], 101)
        self.assertEqual(data['listing_title'], 'Calculus 9th Ed')

        # Verify listing
        list_res = self.client.get('/api/chat/conversations/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        list_data = list_res.json()
        self.assertEqual(len(list_data), 1)
        self.assertEqual(list_data[0]['other_user']['username'], 'student2')

    def test_user_cannot_start_conversation_with_themselves(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            'other_user_id': self.user1.id,
            'listing_id': 105,
            'listing_title': 'Self Item'
        }
        res = self.client.post('/api/chat/conversations/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot start a conversation with yourself', str(res.json()))

    def test_duplicate_conversation_prevention(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            'other_user_id': self.user2.id,
            'listing_id': 200,
            'listing_title': 'Chemistry Lab Coat'
        }
        # First request creates conversation
        res1 = self.client.post('/api/chat/conversations/', payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        conv_id_1 = res1.json()['id']

        # Second request from user1 for the same listing retrieves existing
        res2 = self.client.post('/api/chat/conversations/', payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.json()['id'], conv_id_1)

        # Request from user2 with other_user_id = user1 for the same listing retrieves the same conversation
        self.client.force_authenticate(user=self.user2)
        payload_reversed = {
            'other_user_id': self.user1.id,
            'listing_id': 200,
            'listing_title': 'Chemistry Lab Coat'
        }
        res3 = self.client.post('/api/chat/conversations/', payload_reversed, format='json')
        self.assertEqual(res3.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res3.json()['id'], conv_id_1)

        # Database must only have 1 conversation
        self.assertEqual(Conversation.objects.filter(listing_id=200).count(), 1)

    def test_user_cannot_access_another_users_conversation_detail(self):
        conv = Conversation.objects.create(
            buyer=self.user1,
            seller=self.user2,
            listing_id=300,
            listing_title='Guitar'
        )

        # User3 is not a participant
        self.client.force_authenticate(user=self.user3)
        res = self.client.get(f'/api/chat/conversations/{conv.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # User1 is participant
        self.client.force_authenticate(user=self.user1)
        res_ok = self.client.get(f'/api/chat/conversations/{conv.id}/')
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)

    def test_user_cannot_fetch_messages_from_unauthorized_conversation(self):
        conv = Conversation.objects.create(
            buyer=self.user1,
            seller=self.user2,
            listing_id=301,
            listing_title='Desk Lamp'
        )
        Message.objects.create(
            conversation=conv,
            sender=self.user1,
            content='Hi! Still available?'
        )

        # User3 attempts to read messages
        self.client.force_authenticate(user=self.user3)
        res = self.client.get(f'/api/chat/conversations/{conv.id}/messages/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # User2 can read messages
        self.client.force_authenticate(user=self.user2)
        res2 = self.client.get(f'/api/chat/conversations/{conv.id}/messages/')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        data = res2.json()
        messages = data.get('results', data)
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]['content'], 'Hi! Still available?')

    def test_ws_ticket_generation_and_reuse_prevention(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.post('/api/chat/ws-ticket/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn('ticket', data)
        self.assertEqual(data['expires_in'], 60)

        raw_ticket = data['ticket']
        signer = TimestampSigner(salt='ws-chat-ticket')
        payload = signer.unsign_object(raw_ticket, max_age=60)
        self.assertEqual(payload['user_id'], self.user1.id)
        nonce = payload['nonce']
        cache_key = f"ws_ticket_{nonce}"

        # Nonce should exist in cache
        self.assertEqual(cache.get(cache_key), self.user1.id)


class ChatWebSocketTests(TransactionTestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='ws_user1@student.edu',
            username='ws_student1',
            password='StrongPassword123!',
            mobile_number='9876543220'
        )
        self.user2 = User.objects.create_user(
            email='ws_user2@student.edu',
            username='ws_student2',
            password='StrongPassword123!',
            mobile_number='9876543221'
        )
        self.user3 = User.objects.create_user(
            email='ws_user3@student.edu',
            username='ws_student3',
            password='StrongPassword123!',
            mobile_number='9876543222'
        )
        self.conv = Conversation.objects.create(
            buyer=self.user1,
            seller=self.user2,
            listing_id=500,
            listing_title='Scientific Calculator'
        )

    def _get_ticket_for_user(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        client = APIClient()
        client.force_authenticate(user=user)
        res = client.post('/api/chat/ws-ticket/')
        return res.json()['ticket']

    async def test_unauthorized_ws_without_ticket_is_rejected(self):
        communicator = WebsocketCommunicator(application, f"/ws/chat/{self.conv.id}/")
        connected, close_code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(close_code, 4001)

    async def test_unauthorized_user_outside_conversation_is_rejected(self):
        ticket = self._get_ticket_for_user(self.user3)
        communicator = WebsocketCommunicator(application, f"/ws/chat/{self.conv.id}/?ticket={ticket}")
        connected, close_code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(close_code, 4003)

    async def test_ticket_single_use_prevention(self):
        ticket = self._get_ticket_for_user(self.user1)
        # First use connects successfully
        communicator1 = WebsocketCommunicator(application, f"/ws/chat/{self.conv.id}/?ticket={ticket}")
        connected1, _ = await communicator1.connect()
        self.assertTrue(connected1)
        await communicator1.disconnect()

        # Reusing the exact same ticket must fail because nonce was consumed
        communicator2 = WebsocketCommunicator(application, f"/ws/chat/{self.conv.id}/?ticket={ticket}")
        connected2, close_code2 = await communicator2.connect()
        self.assertFalse(connected2)
        self.assertEqual(close_code2, 4001)

    async def test_successful_message_send_and_broadcast_and_persistence(self):
        ticket1 = self._get_ticket_for_user(self.user1)
        ticket2 = self._get_ticket_for_user(self.user2)

        comm1 = WebsocketCommunicator(application, f"/ws/chat/{self.conv.id}/?ticket={ticket1}")
        comm2 = WebsocketCommunicator(application, f"/ws/chat/{self.conv.id}/?ticket={ticket2}")

        connected1, _ = await comm1.connect()
        connected2, _ = await comm2.connect()
        self.assertTrue(connected1)
        self.assertTrue(connected2)

        # User 1 sends message
        msg_text = "Hello! Is the Casio calculator still available?"
        await comm1.send_json_to({'content': msg_text})

        # User 2 receives message
        response = await comm2.receive_json_from()
        self.assertEqual(response['type'], 'chat_message')
        self.assertEqual(response['message']['content'], msg_text)
        self.assertEqual(response['message']['sender_username'], 'ws_student1')

        # User 1 also receives the broadcast
        response1 = await comm1.receive_json_from()
        self.assertEqual(response1['type'], 'chat_message')
        self.assertEqual(response1['message']['content'], msg_text)

        await comm1.disconnect()
        await comm2.disconnect()

        # Verify permanent message persistence in database
        msg = await Message.objects.filter(conversation=self.conv).afirst()
        self.assertIsNotNone(msg)
        self.assertEqual(msg.content, msg_text)
        self.assertEqual(msg.sender_id, self.user1.id)

    async def test_message_length_and_empty_validation(self):
        ticket = self._get_ticket_for_user(self.user1)
        comm = WebsocketCommunicator(application, f"/ws/chat/{self.conv.id}/?ticket={ticket}")
        connected, _ = await comm.connect()
        self.assertTrue(connected)

        # 1. Empty message
        await comm.send_json_to({'content': '   '})
        err_res = await comm.receive_json_from()
        self.assertEqual(err_res['type'], 'error')
        self.assertIn('empty', err_res['error'])

        # 2. Exceeding 2000 characters
        long_text = 'A' * 2001
        await comm.send_json_to({'content': long_text})
        err_res2 = await comm.receive_json_from()
        self.assertEqual(err_res2['type'], 'error')
        self.assertIn('maximum length', err_res2['error'])

        await comm.disconnect()
