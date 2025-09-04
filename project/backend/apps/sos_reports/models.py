from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class SOSReport(models.Model):
    """
    Model for emergency SOS reports from citizens
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('false_alarm', 'False Alarm'),
    ]
    
    CATEGORY_CHOICES = [
        ('medical', 'Medical Emergency'),
        ('rescue', 'Rescue Required'),
        ('shelter', 'Shelter Needed'),
        ('food', 'Food/Water Required'),
        ('evacuation', 'Evacuation Required'),
        ('fire', 'Fire Emergency'),
        ('flood', 'Flood Emergency'),
        ('earthquake', 'Earthquake Emergency'),
        ('other', 'Other'),
    ]
    
    # Basic Information
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sos_reports')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Location Information
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField(blank=True)
    landmark = models.CharField(max_length=200, blank=True)
    
    # Contact Information
    contact_phone = models.CharField(max_length=17, blank=True)
    contact_email = models.EmailField(blank=True)
    
    # Media Files
    image = models.CharField(max_length=500, blank=True, null=True)  # URL to image
    video = models.CharField(max_length=500, blank=True, null=True)  # URL to video
    
    # AI Analysis
    ai_verified = models.BooleanField(default=False)
    ai_confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    ai_category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True)
    ai_notes = models.TextField(blank=True)
    
    # Response Information
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_reports', limit_choices_to={'role': 'responder'}
    )
    response_notes = models.TextField(blank=True)
    estimated_resolution_time = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'sos_reports'
        verbose_name = 'SOS Report'
        verbose_name_plural = 'SOS Reports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_category_display()} ({self.get_status_display()})"
    
    @property
    def is_urgent(self):
        return self.priority in ['high', 'critical']
    
    @property
    def is_resolved(self):
        return self.status == 'resolved'


class ReportUpdate(models.Model):
    """
    Model for tracking updates to SOS reports
    """
    report = models.ForeignKey(SOSReport, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    update_type = models.CharField(max_length=50)  # status_change, assignment, note_added, etc.
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_updates'
        verbose_name = 'Report Update'
        verbose_name_plural = 'Report Updates'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Update for {self.report.title} by {self.updated_by.get_full_name()}"


class ReportComment(models.Model):
    """
    Model for comments on SOS reports
    """
    report = models.ForeignKey(SOSReport, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_internal = models.BooleanField(default=False)  # Internal notes vs public comments
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'report_comments'
        verbose_name = 'Report Comment'
        verbose_name_plural = 'Report Comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.get_full_name()} on {self.report.title}"


class EmergencyResource(models.Model):
    """
    Model for tracking emergency resources and their availability
    """
    RESOURCE_TYPES = [
        ('ambulance', 'Ambulance'),
        ('fire_truck', 'Fire Truck'),
        ('rescue_team', 'Rescue Team'),
        ('medical_team', 'Medical Team'),
        ('food_supply', 'Food Supply'),
        ('water_supply', 'Water Supply'),
        ('shelter', 'Shelter'),
        ('evacuation_vehicle', 'Evacuation Vehicle'),
        ('communication_equipment', 'Communication Equipment'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=30, choices=RESOURCE_TYPES)
    description = models.TextField(blank=True)
    location_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    capacity = models.PositiveIntegerField(default=1)
    available_capacity = models.PositiveIntegerField(default=1)
    contact_person = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=17)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'emergency_resources'
        verbose_name = 'Emergency Resource'
        verbose_name_plural = 'Emergency Resources'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_resource_type_display()})"
    
    @property
    def utilization_percentage(self):
        if self.capacity == 0:
            return 0
        return ((self.capacity - self.available_capacity) / self.capacity) * 100
