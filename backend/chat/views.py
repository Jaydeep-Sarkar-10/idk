import secrets
from django.core.signing import TimestampSigner
from django.core.cache import cache
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import PermissionDenied, NotFound

from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    CreateConversationSerializer,
    MessageSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ConversationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateConversationSerializer
        return ConversationListSerializer

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(buyer=user) | Q(seller=user)
        ).select_related('buyer', 'seller').prefetch_related('messages').order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        
        # Serialize with full list serializer for complete details
        response_serializer = ConversationListSerializer(conversation, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ConversationDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationListSerializer

    def get_object(self):
        user = self.request.user
        pk = self.kwargs.get('pk')
        try:
            conversation = Conversation.objects.select_related('buyer', 'seller').get(pk=pk)
        except Conversation.DoesNotExist:
            raise NotFound("Conversation not found.")

        if not conversation.is_participant(user):
            raise PermissionDenied("You are not a participant in this conversation.")

        return conversation


class MessageListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        conversation_id = self.kwargs.get('conversation_id')

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            raise NotFound("Conversation not found.")

        if not conversation.is_participant(user):
            raise PermissionDenied("You are not authorized to view messages in this conversation.")

        # Mark unread messages sent by the other user as read
        unread_msgs = Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(sender=user)
        if unread_msgs.exists():
            unread_msgs.update(is_read=True)

        return conversation.messages.select_related('sender').order_by('created_at')


class WsTicketView(APIView):
    """
    Generates a single-use, short-lived cryptographic ticket for WebSocket authentication.
    Does not expose raw JWT tokens in WebSocket URLs or access logs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        nonce = secrets.token_urlsafe(16)
        ttl_seconds = 60

        # Store nonce in server-side cache mapped to user ID
        cache_key = f"ws_ticket_{nonce}"
        cache.set(cache_key, user.id, timeout=ttl_seconds)

        # Sign payload with timestamp
        signer = TimestampSigner(salt='ws-chat-ticket')
        signed_ticket = signer.sign_object({
            'user_id': user.id,
            'nonce': nonce,
        })

        return Response({
            'ticket': signed_ticket,
            'expires_in': ttl_seconds
        }, status=status.HTTP_200_OK)
