from urllib.parse import parse_qs
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.cache import cache
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async

User = get_user_model()


@database_sync_to_async
def get_user_from_id(user_id):
    try:
        return User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()


class TicketAuthMiddleware:
    """
    Channels middleware that extracts and validates a short-lived, single-use ticket
    from the WebSocket query string (?ticket=...).
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'websocket':
            query_string = scope.get('query_string', b'').decode('utf-8')
            params = parse_qs(query_string)
            ticket_values = params.get('ticket')

            if ticket_values:
                raw_ticket = ticket_values[0]
                signer = TimestampSigner(salt='ws-chat-ticket')
                try:
                    # Validates signature and maximum age (60 seconds)
                    payload = signer.unsign_object(raw_ticket, max_age=60)
                    user_id = payload.get('user_id')
                    nonce = payload.get('nonce')

                    if user_id and nonce:
                        cache_key = f"ws_ticket_{nonce}"
                        # Atomic check and consume
                        cached_uid = cache.get(cache_key)
                        if cached_uid is not None and cached_uid == user_id:
                            # Delete nonce to prevent replay/reuse
                            cache.delete(cache_key)
                            scope['user'] = await get_user_from_id(user_id)
                        else:
                            # Nonce invalid, expired, or already used
                            scope['user'] = AnonymousUser()
                    else:
                        scope['user'] = AnonymousUser()
                except (BadSignature, SignatureExpired, Exception):
                    scope['user'] = AnonymousUser()
            else:
                scope['user'] = AnonymousUser()
        else:
            scope.setdefault('user', AnonymousUser())

        return await self.inner(scope, receive, send)
