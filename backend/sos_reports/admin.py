from django.contrib import admin
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import render
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import SOSReport, ReportMedia, ReportUpdate
from .admin_views import admin_dashboard

@admin.register(SOSReport)
class SOSReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'disaster_type', 'priority_badge', 'status_badge', 'phone_number', 'location', 'ai_confidence_bar', 'created_at']
    list_filter = ['disaster_type', 'priority', 'status', 'ai_verified', 'created_at']
    search_fields = ['phone_number', 'address', 'description', 'user__username']
    readonly_fields = ['ai_verified', 'ai_confidence', 'created_at', 'updated_at', 'verified_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'phone_number', 'latitude', 'longitude', 'address')
        }),
        ('Emergency Details', {
            'fields': ('disaster_type', 'description', 'priority', 'status')
        }),
        ('AI Analysis', {
            'fields': ('ai_verified', 'ai_confidence'),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': ('verified_by', 'verified_at'),
            'classes': ('collapse',)
        }),
        ('System', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_verified', 'mark_as_resolved', 'mark_as_false_alarm']
    
    def priority_badge(self, obj):
        colors = {
            'LOW': '#4caf50',
            'MEDIUM': '#ff9800', 
            'HIGH': '#f44336',
            'CRITICAL': '#d32f2f'
        }
        color = colors.get(obj.priority, '#757575')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color, obj.priority
        )
    priority_badge.short_description = 'Priority'
    
    def status_badge(self, obj):
        colors = {
            'PENDING': '#ff9800',
            'VERIFIED': '#2196f3',
            'IN_PROGRESS': '#9c27b0',
            'RESOLVED': '#4caf50',
            'REJECTED': '#f44336',
            'FALSE_ALARM': '#757575'
        }
        color = colors.get(obj.status, '#757575')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = 'Status'
    
    def location(self, obj):
        return format_html(
            '<span title="{}">📍 {}</span>',
            f'Lat: {obj.latitude}, Lng: {obj.longitude}',
            obj.address[:30] + '...' if len(obj.address) > 30 else obj.address
        )
    location.short_description = 'Location'
    
    def ai_confidence_bar(self, obj):
        if obj.ai_confidence > 0:
            width = int(obj.ai_confidence * 100)
            color = '#4caf50' if obj.ai_confidence > 0.8 else '#ff9800' if obj.ai_confidence > 0.6 else '#f44336'
            return format_html(
                '<div style="width: 60px; background: #e0e0e0; border-radius: 3px; height: 16px; position: relative;">'
                '<div style="width: {}%; background: {}; height: 100%; border-radius: 3px;"></div>'
                '<span style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #333;">{}%</span>'
                '</div>',
                width, color, width
            )
        return '-'
    ai_confidence_bar.short_description = 'AI Confidence'
    
    def mark_as_verified(self, request, queryset):
        queryset.update(status='VERIFIED', verified_by=request.user, verified_at=timezone.now())
        self.message_user(request, f'{queryset.count()} reports marked as verified.')
    mark_as_verified.short_description = 'Mark selected reports as verified'
    
    def mark_as_resolved(self, request, queryset):
        queryset.update(status='RESOLVED')
        self.message_user(request, f'{queryset.count()} reports marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected reports as resolved'
    
    def mark_as_false_alarm(self, request, queryset):
        queryset.update(status='FALSE_ALARM')
        self.message_user(request, f'{queryset.count()} reports marked as false alarms.')
    mark_as_false_alarm.short_description = 'Mark selected reports as false alarms'

@admin.register(ReportMedia)
class ReportMediaAdmin(admin.ModelAdmin):
    list_display = ['id', 'report', 'media_type', 'file_preview', 'created_at']
    list_filter = ['media_type', 'created_at']
    readonly_fields = ['ai_analysis', 'created_at']
    search_fields = ['report__id', 'report__address']
    
    def file_preview(self, obj):
        if obj.file:
            if obj.media_type == 'IMAGE':
                return format_html('<img src="{}" style="max-width: 50px; max-height: 50px; border-radius: 4px;" />', obj.file.url)
            else:
                return format_html('<a href="{}" target="_blank">📁 View File</a>', obj.file.url)
        return '-'
    file_preview.short_description = 'Preview'

@admin.register(ReportUpdate)
class ReportUpdateAdmin(admin.ModelAdmin):
    list_display = ['id', 'report', 'user', 'status_change', 'message_preview', 'created_at']
    list_filter = ['status_change', 'created_at']
    readonly_fields = ['created_at']
    search_fields = ['report__id', 'user__username', 'message']
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'

# Custom Admin Site Configuration
admin.site.site_header = "NUDRRS Emergency Management System"
admin.site.site_title = "NUDRRS Admin"
admin.site.index_title = "Emergency Reports Administration"

# Add custom admin dashboard view
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.urls import path
from django.contrib import admin

@staff_member_required
def emergency_dashboard_view(request):
    """Custom emergency dashboard view"""
    from .models import SOSReport, ReportUpdate
    from django.db.models import Count
    from django.utils import timezone
    from datetime import timedelta
    
    now = timezone.now()
    today = now.date()
    week_ago = now - timedelta(days=7)
    
    total_reports = SOSReport.objects.count()
    pending_reports = SOSReport.objects.filter(status='PENDING').count()
    critical_reports = SOSReport.objects.filter(priority='CRITICAL').count()
    resolved_today = SOSReport.objects.filter(
        status='RESOLVED',
        updated_at__date=today
    ).count()
    
    recent_reports = SOSReport.objects.order_by('-created_at')[:10]
    status_stats = SOSReport.objects.values('status').annotate(
        count=Count('status')
    ).order_by('-count')
    priority_stats = SOSReport.objects.values('priority').annotate(
        count=Count('priority')
    ).order_by('-count')
    
    context = {
        'title': 'Emergency Dashboard',
        'total_reports': total_reports,
        'pending_reports': pending_reports,
        'critical_reports': critical_reports,
        'resolved_today': resolved_today,
        'recent_reports': recent_reports,
        'status_stats': status_stats,
        'priority_stats': priority_stats,
        'app_list': admin.site.get_app_list(request),
        'user': request.user,
        'site_title': admin.site.site_title,
        'site_header': admin.site.site_header,
        'index_title': admin.site.index_title,
    }
    
    return render(request, 'admin/sos_reports/dashboard.html', context)

# Emergency dashboard is now available as a simple admin view
# Access it via: http://localhost:8000/admin/emergency-dashboard/
