import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from classes import routing as class_route
from accounts import routing as accounts_route

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'schedule_system.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                class_route.websocket_urlpatterns + accounts_route.websocket_urlpatterns
            )
        )
    ),
})
