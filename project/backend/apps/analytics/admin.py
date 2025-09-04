from django.contrib import admin
from .models import DashboardMetrics, ReportAnalytics, SystemPerformance, UserActivity, DisasterPrediction


@admin.register(DashboardMetrics)
class DashboardMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'hour', 'total_sos_reports', 'resolved_reports',
        'average_response_time_minutes'
    ]
    list_filter = ['date', 'hour']
    search_fields = ['date']


@admin.register(ReportAnalytics)
class ReportAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'report', 'ai_confidence_score', 'first_response_time_minutes',
        'resolution_time_minutes', 'user_satisfaction_rating'
    ]
    list_filter = ['user_satisfaction_rating', 'created_at']
    search_fields = ['report__title']


@admin.register(SystemPerformance)
class SystemPerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'hour', 'total_api_requests', 'average_response_time_ms',
        'cpu_usage_percentage', 'error_count'
    ]
    list_filter = ['date', 'hour']
    search_fields = ['date']


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'activity_type', 'created_at'
    ]
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'activity_description']


@admin.register(DisasterPrediction)
class DisasterPredictionAdmin(admin.ModelAdmin):
    list_display = [
        'prediction_type', 'predicted_date', 'confidence_score',
        'severity_level', 'is_active', 'is_verified'
    ]
    list_filter = [
        'prediction_type', 'severity_level', 'is_active', 'is_verified'
    ]
    search_fields = ['model_name']
