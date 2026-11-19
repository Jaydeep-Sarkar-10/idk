from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Conversation(models.Model):
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='buyer_conversations'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='seller_conversations'
    )
    listing_id = models.IntegerField(null=True, blank=True)
    listing_title = models.CharField(max_length=255, null=True, blank=True)
    listing_image = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(buyer=models.F('seller')),
                name='prevent_self_conversation'
            ),
            models.UniqueConstraint(
                fields=['buyer', 'seller', 'listing_id'],
                name='unique_buyer_seller_listing',
                nulls_distinct=False
            )
        ]
        indexes = [
            models.Index(fields=['buyer', '-updated_at']),
            models.Index(fields=['seller', '-updated_at']),
            models.Index(fields=['listing_id']),
        ]

    def clean(self):
        super().clean()
        if self.buyer_id and self.seller_id and self.buyer_id == self.seller_id:
            raise ValidationError("A user cannot start a conversation with themselves.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def is_participant(self, user):
        if not user or not user.is_authenticated:
            return False
        return self.buyer_id == user.id or self.seller_id == user.id

    def get_other_user(self, user):
        if not user or not user.is_authenticated:
            return None
        if self.buyer_id == user.id:
            return self.seller
        elif self.seller_id == user.id:
            return self.buyer
        return None

    def __str__(self):
        title = self.listing_title or "General"
        return f"Conv #{self.id}: {self.buyer.username} & {self.seller.username} ({title})"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField(max_length=2000)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['conversation', 'is_read']),
        ]

    def clean(self):
        super().clean()
        if not self.content or not self.content.strip():
            raise ValidationError("Message content cannot be empty.")
        if len(self.content) > 2000:
            raise ValidationError("Message content cannot exceed 2000 characters.")
        if self.conversation_id and not self.conversation.is_participant(self.sender):
            raise ValidationError("Sender is not a participant in this conversation.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Msg #{self.id} by {self.sender.username} in Conv #{self.conversation_id}"
