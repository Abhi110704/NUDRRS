from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import RegexValidator

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Administrator'),
        ('MANAGER', 'Manager'),
        ('RESPONDER', 'Emergency Responder'),
        ('ANALYST', 'Data Analyst'),
        ('VIEWER', 'Viewer'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='VIEWER')
    phone_number = models.CharField(
        max_length=15, 
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$',
                message='Enter a valid Indian phone number (e.g., +91-9876543210 or 9876543210)'
            )
        ]
    )
    organization = models.ForeignKey('Organization', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Organization(models.Model):
    ORG_TYPE_CHOICES = [
        ('GOVERNMENT', 'Government Agency'),
        ('NGO', 'Non-Governmental Organization'),
        ('PRIVATE', 'Private Company'),
        ('VOLUNTEER', 'Volunteer Group'),
        ('OTHER', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    org_type = models.CharField(max_length=20, choices=ORG_TYPE_CHOICES)
    address = models.TextField(blank=True)
    contact_person = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(
        max_length=15, 
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$',
                message='Enter a valid Indian phone number (e.g., +91-9876543210 or 9876543210)'
            )
        ]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.name

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.created_at}"
