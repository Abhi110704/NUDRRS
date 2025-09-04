from django.contrib import admin
from .models import SOSReport, ReportUpdate, ReportComment, EmergencyResource


@admin.register(SOSReport)
class SOSReportAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'reporter', 'category', 'priority', 'status',
        'assigned_to', 'created_at', 'is_urgent'
    ]
    list_filter = [
        'category', 'priority', 'status', 'ai_verified',
        'created_at', 'assigned_to'
    ]
    search_fields = [
        'title', 'description', 'reporter__email', 'reporter__first_name',
        'reporter__last_name', 'address'
    ]
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('reporter', 'title', 'description', 'category', 'priority', 'status')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'address', 'landmark')
        }),
        ('Contact Information', {
            'fields': ('contact_phone', 'contact_email')
        }),
        ('Media Files', {
            'fields': ('image', 'video')
        }),
        ('AI Analysis', {
            'fields': ('ai_verified', 'ai_confidence', 'ai_category', 'ai_notes')
        }),
        ('Response Information', {
            'fields': ('assigned_to', 'response_notes', 'estimated_resolution_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )


@admin.register(ReportUpdate)
class ReportUpdateAdmin(admin.ModelAdmin):
    list_display = ['report', 'updated_by', 'update_type', 'created_at']
    list_filter = ['update_type', 'created_at']
    search_fields = ['report__title', 'updated_by__email', 'description']
    readonly_fields = ['created_at']


@admin.register(ReportComment)
class ReportCommentAdmin(admin.ModelAdmin):
    list_display = ['report', 'author', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']
    search_fields = ['report__title', 'author__email', 'content']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EmergencyResource)
class EmergencyResourceAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'resource_type', 'capacity',
        'available_capacity', 'is_available', 'utilization_percentage'
    ]
    list_filter = ['resource_type', 'is_available', 'created_at']
    search_fields = ['name', 'description', 'contact_person', 'contact_phone']
    readonly_fields = ['created_at', 'updated_at', 'utilization_percentage']