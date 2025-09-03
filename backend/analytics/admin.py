from django.contrib import admin
from .models import SystemMetrics, ResponseTimeLog, AIAccuracyLog

@admin.register(SystemMetrics)
class SystemMetricsAdmin(admin.ModelAdmin):
    list_display = ['metric_name', 'metric_value', 'recorded_at']
    list_filter = ['metric_name', 'recorded_at']
    search_fields = ['metric_name']
    readonly_fields = ['recorded_at']

@admin.register(ResponseTimeLog)
class ResponseTimeLogAdmin(admin.ModelAdmin):
    list_display = ['report', 'response_time_minutes', 'recorded_at']
    list_filter = ['recorded_at']
    readonly_fields = ['recorded_at']

@admin.register(AIAccuracyLog)
class AIAccuracyLogAdmin(admin.ModelAdmin):
    list_display = ['report', 'accuracy_score', 'recorded_at']
    list_filter = ['recorded_at']
    readonly_fields = ['recorded_at']
