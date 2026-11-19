"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from chat.routing import websocket_urlpatterns
from chat.middleware import TicketAuthMiddleware

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': TicketAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
