from django.urls import path
from .consumers import StudentConsumer

websocket_urlpatterns = [
    path('ws/students/', StudentConsumer.as_asgi()),
]
