from django.urls import path
from .views import send_notification, get_notifications, broadcast_notification

urlpatterns = [
    path('send/', send_notification, name='send_notification'),
    path('list/', get_notifications, name='get_notifications'),
    path('broadcast/', broadcast_notification, name='broadcast_notification'),
]
