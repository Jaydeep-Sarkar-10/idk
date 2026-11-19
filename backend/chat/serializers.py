from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Conversation, Message

User = get_user_model()


class ChatUserSerializer(serializers.ModelSerializer):
    """
    Safe public user summary for chat interfaces.
    Never exposes sensitive info such as phone number or email.
    """
    class Meta:
        model = User
        fields = ('id', 'username')


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender_id', 'sender_username', 'content', 'is_read', 'created_at')
        read_only_fields = ('id', 'conversation', 'sender_id', 'sender_username', 'is_read', 'created_at')

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        if len(value) > 2000:
            raise serializers.ValidationError("Message content cannot exceed 2000 characters.")
        return value.strip()


class ConversationListSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    latest_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            'id',
            'other_user',
            'listing_id',
            'listing_title',
            'listing_image',
            'latest_message',
            'unread_count',
            'created_at',
            'updated_at',
        )

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        other = obj.get_other_user(request.user)
        if other:
            return ChatUserSerializer(other).data
        return None

    def get_latest_message(self, obj):
        latest = obj.messages.order_by('-created_at').first()
        if latest:
            return MessageSerializer(latest).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class CreateConversationSerializer(serializers.Serializer):
    other_user_id = serializers.IntegerField(required=True)
    listing_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    listing_title = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=255, default='')
    listing_image = serializers.URLField(required=False, allow_blank=True, allow_null=True, max_length=500, default='')

    def validate_other_user_id(self, value):
        request = self.context.get('request')
        if request and request.user.id == value:
            raise serializers.ValidationError("You cannot start a conversation with yourself.")

        try:
            other_user = User.objects.get(id=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("The selected user does not exist or is inactive.")

        return value

    def create(self, validated_data):
        request = self.context['request']
        current_user = request.user
        other_user_id = validated_data['other_user_id']
        other_user = User.objects.get(id=other_user_id)
        listing_id = validated_data.get('listing_id')
        listing_title = validated_data.get('listing_title') or ''
        listing_image = validated_data.get('listing_image') or ''

        # Check if conversation already exists between these users for the specified listing
        existing_query = (
            (Q(buyer=current_user, seller=other_user) | Q(buyer=other_user, seller=current_user))
        )
        if listing_id is not None:
            existing = Conversation.objects.filter(existing_query, listing_id=listing_id).first()
        else:
            existing = Conversation.objects.filter(existing_query, listing_id__isnull=True).first()

        if existing:
            # If title or image was not set earlier, update them if newly provided
            update_fields = []
            if listing_title and not existing.listing_title:
                existing.listing_title = listing_title
                update_fields.append('listing_title')
            if listing_image and not existing.listing_image:
                existing.listing_image = listing_image
                update_fields.append('listing_image')
            if update_fields:
                existing.save(update_fields=update_fields)
            return existing

        # Create new conversation: the authenticated user initiating the conversation is the buyer
        conversation = Conversation.objects.create(
            buyer=current_user,
            seller=other_user,
            listing_id=listing_id,
            listing_title=listing_title,
            listing_image=listing_image
        )
        return conversation
