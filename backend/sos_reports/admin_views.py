from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.admin.views.main import ChangeList
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.cache import never_cache
from datetime import timedelta
from .models import SOSReport, ReportUpdate

@staff_member_required
@never_cache
def admin_dashboard(request):
    """Custom admin dashboard with emergency statistics"""
    
    # Get time ranges
    now = timezone.now()
    today = now.date()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Basic statistics
    total_reports = SOSReport.objects.count()
    pending_reports = SOSReport.objects.filter(status='PENDING').count()
    critical_reports = SOSReport.objects.filter(priority='CRITICAL').count()
    resolved_today = SOSReport.objects.filter(
        status='RESOLVED',
        updated_at__date=today
    ).count()
    
    # Recent activity
    recent_reports = SOSReport.objects.order_by('-created_at')[:10]
    recent_updates = ReportUpdate.objects.order_by('-created_at')[:10]
    
    # Status distribution
    status_stats = SOSReport.objects.values('status').annotate(
        count=Count('status')
    ).order_by('-count')
    
    # Priority distribution
    priority_stats = SOSReport.objects.values('priority').annotate(
        count=Count('priority')
    ).order_by('-count')
    
    # Disaster type distribution
    disaster_stats = SOSReport.objects.values('disaster_type').annotate(
        count=Count('disaster_type')
    ).order_by('-count')
    
    # Time-based statistics
    reports_last_week = SOSReport.objects.filter(created_at__gte=week_ago).count()
    reports_last_month = SOSReport.objects.filter(created_at__gte=month_ago).count()
    
    # AI verification stats
    ai_verified_count = SOSReport.objects.filter(ai_verified=True).count()
    ai_verification_rate = (ai_verified_count / total_reports * 100) if total_reports > 0 else 0
    
    # Response time analysis (simplified)
    avg_response_time = 0  # This would need more complex calculation
    
    context = {
        'title': 'Emergency Dashboard',
        'total_reports': total_reports,
        'pending_reports': pending_reports,
        'critical_reports': critical_reports,
        'resolved_today': resolved_today,
        'recent_reports': recent_reports,
        'recent_updates': recent_updates,
        'status_stats': status_stats,
        'priority_stats': priority_stats,
        'disaster_stats': disaster_stats,
        'reports_last_week': reports_last_week,
        'reports_last_month': reports_last_month,
        'ai_verified_count': ai_verified_count,
        'ai_verification_rate': round(ai_verification_rate, 1),
        'avg_response_time': avg_response_time,
        'app_list': admin.site.get_app_list(request),
        'has_permission': request.user.has_perm('sos_reports.view_sosreport'),
        'user': request.user,
        'site_title': admin.site.site_title,
        'site_header': admin.site.site_header,
        'index_title': admin.site.index_title,
    }
    
    return render(request, 'admin/sos_reports/dashboard.html', context)
