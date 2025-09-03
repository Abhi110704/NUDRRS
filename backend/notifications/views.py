from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification, NotificationTemplate
from .services import NotificationService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification(request):
    """Send notification to specified recipient"""
    recipient = request.data.get('recipient')
    message = request.data.get('message')
    notification_type = request.data.get('type', 'SMS')
    report_id = request.data.get('report_id')
    
    if not recipient or not message:
        return Response(
            {'error': 'Recipient and message are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    notification_service = NotificationService()
    result = notification_service.send_notification(
        recipient=recipient,
        message=message,
        notification_type=notification_type,
        report_id=report_id
    )
    
    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get list of notifications"""
    notifications = Notification.objects.all()[:50]
    
    data = []
    for notification in notifications:
        data.append({
            'id': notification.id,
            'recipient': notification.recipient,
            'message': notification.message,
            'type': notification.notification_type,
            'status': notification.status,
            'sent_at': notification.sent_at,
            'created_at': notification.created_at
        })
    
    return Response({'notifications': data})
