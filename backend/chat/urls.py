from django.urls import path
from .views import (
    ConversationListCreateView,
    ConversationDetailView,
    MessageListView,
    WsTicketView,
)

app_name = 'chat'

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation_list_create'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='message_list'),
    path('ws-ticket/', WsTicketView.as_view(), name='ws_ticket'),
]
