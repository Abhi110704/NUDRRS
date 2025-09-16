from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification, NotificationTemplate
from .services import NotificationService
from .mongodb_service import notification_mongodb_service

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification(request):
    """Send notification to specified recipient"""
    try:
        recipient = request.data.get('recipient')
        message = request.data.get('message')
        notification_type = request.data.get('type', 'SMS')
        report_id = request.data.get('report_id')
        priority = request.data.get('priority', 'MEDIUM')
        
        if not recipient or not message:
            return Response(
                {'error': 'Recipient and message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create notification data for MongoDB
        notification_data = {
            'recipient': recipient,
            'message': message,
            'type': notification_type,
            'priority': priority,
            'report_id': report_id,
            'is_broadcast': False
        }
        
        # Create notification in MongoDB
        created_notification = notification_mongodb_service.create_notification(notification_data)
        
        if created_notification:
            # Try to send via notification service (optional)
            try:
                notification_service = NotificationService()
                result = notification_service.send_notification(
                    recipient=recipient,
                    message=message,
                    notification_type=notification_type,
                    report_id=report_id
                )
                
                # Update status if sent successfully
                if result.get('success'):
                    notification_mongodb_service.update_notification_status(
                        created_notification['id'], 'sent'
                    )
                    created_notification['status'] = 'sent'
                else:
                    notification_mongodb_service.update_notification_status(
                        created_notification['id'], 'failed'
                    )
                    created_notification['status'] = 'failed'
                    
            except Exception as e:
                print(f"Notification service failed: {e}")
                # Keep notification as pending if service fails
                created_notification['status'] = 'pending'
            
            return Response({
                'success': True,
                'notification': created_notification,
                'message': 'Notification created successfully'
            })
        else:
            return Response(
                {'error': 'Failed to create notification'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get list of notifications from MongoDB"""
    try:
        # Get query parameters
        limit = int(request.query_params.get('limit', 50))
        skip = int(request.query_params.get('skip', 0))
        user_id = request.query_params.get('user_id')
        
        # Get notifications from MongoDB
        notifications = notification_mongodb_service.get_notifications(
            limit=limit,
            skip=skip,
            user_id=user_id
        )
        
        return Response({'notifications': notifications})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def broadcast_notification(request):
    """Send broadcast notification to all users"""
    try:
        message = request.data.get('message')
        notification_type = request.data.get('type', 'BROADCAST')
        priority = request.data.get('priority', 'MEDIUM')
        
        if not message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create broadcast notification in MongoDB
        broadcast_notification = notification_mongodb_service.broadcast_notification(
            message=message,
            notification_type=notification_type,
            priority=priority
        )
        
        if broadcast_notification:
            return Response({
                'success': True,
                'notification': broadcast_notification,
                'message': 'Broadcast notification sent successfully'
            })
        else:
            return Response(
                {'error': 'Failed to send broadcast notification'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
