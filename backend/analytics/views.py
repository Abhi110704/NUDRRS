from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from .models import SystemMetrics, ResponseTimeLog, AIAccuracyLog
from sos_reports.models import SOSReport

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics_dashboard(request):
    """Get comprehensive analytics dashboard data"""
    
    # Time ranges
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    last_7_days = now - timedelta(days=7)
    
    # Basic stats
    total_reports = SOSReport.objects.count()
    reports_last_30_days = SOSReport.objects.filter(created_at__gte=last_30_days).count()
    reports_last_7_days = SOSReport.objects.filter(created_at__gte=last_7_days).count()
    
    # Response time metrics
    avg_response_time = ResponseTimeLog.objects.aggregate(
        avg_time=Avg('response_time_minutes')
    )['avg_time'] or 0
    
    # AI accuracy metrics
    avg_ai_accuracy = AIAccuracyLog.objects.aggregate(
        avg_accuracy=Avg('accuracy_score')
    )['avg_accuracy'] or 0
    
    # Status distribution
    status_distribution = SOSReport.objects.values('status').annotate(
        count=Count('status')
    )
    
    # Priority distribution
    priority_distribution = SOSReport.objects.values('priority').annotate(
        count=Count('priority')
    )
    
    # Disaster type distribution
    disaster_type_distribution = SOSReport.objects.values('disaster_type').annotate(
        count=Count('disaster_type')
    )
    
    # Daily reports trend (last 30 days)
    daily_reports = []
    for i in range(30):
        date = now - timedelta(days=i)
        count = SOSReport.objects.filter(
            created_at__date=date.date()
        ).count()
        daily_reports.append({
            'date': date.strftime('%Y-%m-%d'),
            'count': count
        })
    
    return Response({
        'summary': {
            'total_reports': total_reports,
            'reports_last_30_days': reports_last_30_days,
            'reports_last_7_days': reports_last_7_days,
            'avg_response_time_minutes': round(avg_response_time, 1),
            'avg_ai_accuracy_percent': round(avg_ai_accuracy, 1),
        },
        'distributions': {
            'status': list(status_distribution),
            'priority': list(priority_distribution),
            'disaster_type': list(disaster_type_distribution),
        },
        'trends': {
            'daily_reports': daily_reports[::-1]  # Reverse to show chronological order
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_response_metrics(request):
    """Get detailed response time metrics"""
    
    response_logs = ResponseTimeLog.objects.all()[:100]
    
    data = []
    for log in response_logs:
        data.append({
            'report_id': log.report.id,
            'disaster_type': log.report.disaster_type,
            'priority': log.report.priority,
            'response_time_minutes': log.response_time_minutes,
            'recorded_at': log.recorded_at
        })
    
    return Response({'response_metrics': data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_metrics(request):
    """Get AI accuracy and performance metrics"""
    
    ai_logs = AIAccuracyLog.objects.all()[:100]
    
    data = []
    for log in ai_logs:
        data.append({
            'report_id': log.report.id,
            'predicted_priority': log.predicted_priority,
            'actual_priority': log.actual_priority,
            'accuracy_score': log.accuracy_score,
            'recorded_at': log.recorded_at
        })
    
    return Response({'ai_metrics': data})
