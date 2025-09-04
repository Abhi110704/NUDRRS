from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import RegexValidator

class SOSReport(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('FALSE_ALARM', 'False Alarm'),
    ]
    
    DISASTER_TYPES = [
        ('FLOOD', 'Flood'),
        ('EARTHQUAKE', 'Earthquake'),
        ('FIRE', 'Fire'),
        ('CYCLONE', 'Cyclone'),
        ('LANDSLIDE', 'Landslide'),
        ('MEDICAL', 'Medical Emergency'),
        ('ACCIDENT', 'Accident'),
        ('OTHER', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    phone_number = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+[1-9]\d{1,14}$',
                message='Enter a valid international phone number (e.g., +919876543210)'
            )
        ]
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField()
    disaster_type = models.CharField(max_length=20, choices=DISASTER_TYPES)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    ai_verified = models.BooleanField(default=False)
    ai_confidence = models.FloatField(default=0.0)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_reports')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_demo = models.BooleanField(default=False, help_text='Whether this is a demo report')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.disaster_type} - {self.priority} - {self.created_at}"

class ReportMedia(models.Model):
    MEDIA_TYPES = [
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
        ('AUDIO', 'Audio'),
    ]
    
    report = models.ForeignKey(SOSReport, related_name='media', on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    file = models.FileField(upload_to='reports/%Y/%m/%d/')
    ai_analysis = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.report.id} - {self.media_type}"

class ReportUpdate(models.Model):
    report = models.ForeignKey(SOSReport, related_name='updates', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    status_change = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Update for {self.report.id} by {self.user.username}"
