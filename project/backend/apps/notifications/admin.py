from django.contrib import admin
from .models import Notification, NotificationTemplate, NotificationPreference, NotificationLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'notification_type', 'priority', 'recipient',
        'is_sent', 'is_read', 'created_at'
    ]
    list_filter = [
        'notification_type', 'priority', 'is_sent', 'is_read', 'created_at'
    ]
    search_fields = ['title', 'message', 'recipient__email']
    readonly_fields = ['created_at', 'sent_at', 'read_at']


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'notification_type', 'priority', 'is_active'
    ]
    list_filter = ['notification_type', 'priority', 'is_active']
    search_fields = ['name', 'title_template']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'email_enabled', 'sms_enabled', 'push_enabled'
    ]
    search_fields = ['user__email']


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = [
        'notification', 'delivery_method', 'delivery_status', 'attempted_at'
    ]
    list_filter = ['delivery_method', 'delivery_status', 'attempted_at']
    search_fields = ['notification__title']
