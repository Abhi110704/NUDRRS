import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import sos_reports.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            sos_reports.routing.websocket_urlpatterns
        )
    ),
})
