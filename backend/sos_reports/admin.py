from django.contrib import admin
from .models import SOSReport, ReportMedia, ReportUpdate

@admin.register(SOSReport)
class SOSReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'disaster_type', 'priority', 'status', 'phone_number', 'created_at']
    list_filter = ['disaster_type', 'priority', 'status', 'ai_verified', 'created_at']
    search_fields = ['phone_number', 'address', 'description']
    readonly_fields = ['ai_verified', 'ai_confidence', 'created_at', 'updated_at']
    
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
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(ReportMedia)
class ReportMediaAdmin(admin.ModelAdmin):
    list_display = ['id', 'report', 'media_type', 'created_at']
    list_filter = ['media_type', 'created_at']
    readonly_fields = ['ai_analysis', 'created_at']

@admin.register(ReportUpdate)
class ReportUpdateAdmin(admin.ModelAdmin):
    list_display = ['id', 'report', 'user', 'status_change', 'created_at']
    list_filter = ['status_change', 'created_at']
    readonly_fields = ['created_at']
