from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from .models import SystemMetrics, ResponseTimeLog, AIAccuracyLog
from sos_reports.mongodb_service import mongodb_service

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics_dashboard(request):
    """Get comprehensive analytics dashboard data from MongoDB"""
    try:
        # Get dashboard stats from MongoDB
        stats = mongodb_service.get_dashboard_stats()
        
        # Get all reports for additional analytics
        all_reports = mongodb_service.get_reports(limit=1000)
        
        # Calculate additional metrics
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)
        
        # Filter reports by date (convert string dates to datetime for comparison)
        reports_last_30_days = 0
        reports_last_7_days = 0
        
        for report in all_reports:
            if 'created_at' in report:
                try:
                    # Parse ISO format date
                    from datetime import datetime
                    if isinstance(report['created_at'], str):
                        report_date = datetime.fromisoformat(report['created_at'].replace('Z', '+00:00'))
                    else:
                        report_date = report['created_at']
                    
                    if report_date >= last_30_days:
                        reports_last_30_days += 1
                    if report_date >= last_7_days:
                        reports_last_7_days += 1
                except:
                    continue
        
        # Calculate average response time (mock data for now)
        avg_response_time = 45.5  # Mock average response time in minutes
        
        # Calculate average AI accuracy (mock data for now)
        avg_ai_accuracy = 87.3  # Mock average AI accuracy percentage
        
        # Prepare distributions
        status_distribution = []
        priority_distribution = []
        disaster_type_distribution = []
        
        # Count distributions
        status_counts = {}
        priority_counts = {}
        disaster_type_counts = {}
        
        for report in all_reports:
            # Status distribution
            status = report.get('status', 'UNKNOWN')
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Priority distribution
            priority = report.get('priority', 'UNKNOWN')
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
            
            # Disaster type distribution
            disaster_type = report.get('disaster_type', 'UNKNOWN')
            disaster_type_counts[disaster_type] = disaster_type_counts.get(disaster_type, 0) + 1
        
        # Convert to list format
        for status, count in status_counts.items():
            status_distribution.append({'status': status, 'count': count})
        
        for priority, count in priority_counts.items():
            priority_distribution.append({'priority': priority, 'count': count})
        
        for disaster_type, count in disaster_type_counts.items():
            disaster_type_distribution.append({'disaster_type': disaster_type, 'count': count})
        
        # Daily reports trend (mock data for now)
        daily_reports = []
        for i in range(30):
            date = now - timedelta(days=i)
            # Mock daily count (in real implementation, you'd query MongoDB by date)
            count = max(0, len(all_reports) // 30 + (i % 3) - 1)
            daily_reports.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        return Response({
            'summary': {
                'total_reports': stats.get('total_reports', 0),
                'reports_last_30_days': reports_last_30_days,
                'reports_last_7_days': reports_last_7_days,
                'avg_response_time_minutes': round(avg_response_time, 1),
                'avg_ai_accuracy_percent': round(avg_ai_accuracy, 1),
            },
            'distributions': {
                'status': status_distribution,
                'priority': priority_distribution,
                'disaster_type': disaster_type_distribution,
            },
            'trends': {
                'daily_reports': daily_reports[::-1]  # Reverse to show chronological order
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

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
