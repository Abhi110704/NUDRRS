from django.db import models
from django.contrib.auth.models import User
from sos_reports.models import SOSReport

class NotificationTemplate(models.Model):
    NOTIFICATION_TYPES = [
        ('SMS', 'SMS'),
        ('EMAIL', 'Email'),
        ('PUSH', 'Push Notification'),
        ('WHATSAPP', 'WhatsApp'),
    ]
    
    name = models.CharField(max_length=100)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.notification_type}"

class Notification(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
        ('DELIVERED', 'Delivered'),
    ]
    
    recipient = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NotificationTemplate.NOTIFICATION_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    report = models.ForeignKey(SOSReport, on_delete=models.CASCADE, null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} to {self.recipient}"

class AlertSubscription(models.Model):
    ALERT_TYPES = [
        ('ALL', 'All Emergencies'),
        ('FLOOD', 'Flood Alerts'),
        ('FIRE', 'Fire Alerts'),
        ('EARTHQUAKE', 'Earthquake Alerts'),
        ('HIGH_PRIORITY', 'High Priority Only'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    phone_number = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.alert_type}"
