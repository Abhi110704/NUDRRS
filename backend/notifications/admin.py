from django.contrib import admin
from .models import NotificationTemplate, Notification, AlertSubscription

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'notification_type', 'is_active', 'created_at']
    list_filter = ['notification_type', 'is_active', 'created_at']
    search_fields = ['name', 'subject', 'message']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notification_type', 'status', 'sent_at']
    list_filter = ['notification_type', 'status', 'sent_at']
    search_fields = ['recipient', 'subject']
    readonly_fields = ['sent_at']

@admin.register(AlertSubscription)
class AlertSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'alert_type', 'phone_number', 'is_active']
    list_filter = ['alert_type', 'is_active', 'created_at']
    search_fields = ['user__username', 'phone_number']
