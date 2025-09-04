from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    """
    Model for system notifications
    """
    NOTIFICATION_TYPES = [
        ('sos_report', 'SOS Report'),
        ('resource_request', 'Resource Request'),
        ('disaster_alert', 'Disaster Alert'),
        ('system_update', 'System Update'),
        ('emergency_broadcast', 'Emergency Broadcast'),
        ('assignment', 'Assignment'),
        ('status_update', 'Status Update'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Notification Details
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Recipients
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True,
        related_name='notifications'
    )
    recipient_role = models.CharField(max_length=20, blank=True)  # For role-based notifications
    
    # Related Objects
    related_sos_report = models.ForeignKey(
        'sos_reports.SOSReport', on_delete=models.CASCADE, null=True, blank=True
    )
    related_resource_request = models.ForeignKey(
        'resource_allocation.ResourceRequest', on_delete=models.CASCADE, null=True, blank=True
    )
    
    # Delivery Information
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivery_method = models.CharField(max_length=20, default='in_app')  # in_app, email, sms, push
    
    # Read Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_priority_display()}"


class NotificationTemplate(models.Model):
    """
    Model for notification templates
    """
    name = models.CharField(max_length=100)
    notification_type = models.CharField(max_length=20, choices=Notification.NOTIFICATION_TYPES)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    priority = models.CharField(max_length=10, choices=Notification.PRIORITY_LEVELS, default='medium')
    
    # Template Variables
    variables = models.JSONField(default=list, blank=True)  # List of available variables
    
    # Delivery Settings
    delivery_methods = models.JSONField(default=list, blank=True)  # ['email', 'sms', 'push']
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.get_notification_type_display()}"


class NotificationPreference(models.Model):
    """
    Model for user notification preferences
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email Preferences
    email_enabled = models.BooleanField(default=True)
    email_sos_reports = models.BooleanField(default=True)
    email_resource_requests = models.BooleanField(default=True)
    email_disaster_alerts = models.BooleanField(default=True)
    email_system_updates = models.BooleanField(default=False)
    
    # SMS Preferences
    sms_enabled = models.BooleanField(default=True)
    sms_critical_only = models.BooleanField(default=True)
    sms_sos_reports = models.BooleanField(default=True)
    sms_disaster_alerts = models.BooleanField(default=True)
    
    # Push Notification Preferences
    push_enabled = models.BooleanField(default=True)
    push_sos_reports = models.BooleanField(default=True)
    push_resource_requests = models.BooleanField(default=True)
    push_disaster_alerts = models.BooleanField(default=True)
    push_system_updates = models.BooleanField(default=False)
    
    # Quiet Hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    # Language Preference
    preferred_language = models.CharField(max_length=10, default='en')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.get_full_name()}"


class NotificationLog(models.Model):
    """
    Model for tracking notification delivery logs
    """
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    delivery_method = models.CharField(max_length=20)
    delivery_status = models.CharField(max_length=20)  # sent, failed, pending
    delivery_response = models.TextField(blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_logs'
        verbose_name = 'Notification Log'
        verbose_name_plural = 'Notification Logs'
        ordering = ['-attempted_at']
    
    def __str__(self):
        return f"Log for {self.notification.title} - {self.delivery_status}"
