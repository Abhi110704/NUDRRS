from django.db import models
from django.contrib.auth.models import User

class ResourceType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return self.name

class Resource(models.Model):
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('DEPLOYED', 'Deployed'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('UNAVAILABLE', 'Unavailable'),
    ]
    
    name = models.CharField(max_length=200)
    resource_type = models.ForeignKey(ResourceType, on_delete=models.CASCADE)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField()
    capacity = models.IntegerField(default=1)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='AVAILABLE')
    contact_number = models.CharField(max_length=15)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.resource_type.name}"

class ResourceDeployment(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    report = models.ForeignKey('sos_reports.SOSReport', on_delete=models.CASCADE)
    deployed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    deployed_at = models.DateTimeField(auto_now_add=True)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='EN_ROUTE')
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.resource.name} -> Report {self.report.id}"
