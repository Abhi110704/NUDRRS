from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ResourceRequest(models.Model):
    """
    Model for resource allocation requests
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('rejected', 'Rejected'),
    ]
    
    # Request Information
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_requests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    resource_type = models.CharField(max_length=50)
    quantity_requested = models.PositiveIntegerField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Location Information
    destination_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_address = models.TextField()
    
    # Timeline
    requested_at = models.DateTimeField(auto_now_add=True)
    required_by = models.DateTimeField()
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Approval Information
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_requests'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True)
    
    # Delivery Information
    assigned_resource = models.ForeignKey(
        'EmergencyResource', on_delete=models.SET_NULL, null=True, blank=True
    )
    delivery_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'resource_requests'
        verbose_name = 'Resource Request'
        verbose_name_plural = 'Resource Requests'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"


class ResourceAllocation(models.Model):
    """
    Model for tracking resource allocations
    """
    request = models.OneToOneField(ResourceRequest, on_delete=models.CASCADE, related_name='allocation')
    allocated_resource = models.ForeignKey(
        'sos_reports.EmergencyResource', on_delete=models.CASCADE
    )
    allocated_quantity = models.PositiveIntegerField()
    allocated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    allocated_at = models.DateTimeField(auto_now_add=True)
    
    # Route Information
    route_coordinates = models.JSONField(default=list, blank=True)
    estimated_delivery_time = models.DateTimeField()
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_delivered = models.BooleanField(default=False)
    delivery_confirmation = models.TextField(blank=True)
    
    class Meta:
        db_table = 'resource_allocations'
        verbose_name = 'Resource Allocation'
        verbose_name_plural = 'Resource Allocations'
        ordering = ['-allocated_at']
    
    def __str__(self):
        return f"Allocation for {self.request.title}"


class ResourceInventory(models.Model):
    """
    Model for tracking resource inventory
    """
    resource = models.ForeignKey('sos_reports.EmergencyResource', on_delete=models.CASCADE)
    current_stock = models.PositiveIntegerField()
    reserved_stock = models.PositiveIntegerField(default=0)
    available_stock = models.PositiveIntegerField()
    
    # Reorder Information
    minimum_stock_level = models.PositiveIntegerField()
    reorder_quantity = models.PositiveIntegerField()
    is_low_stock = models.BooleanField(default=False)
    
    # Last Updated
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'resource_inventory'
        verbose_name = 'Resource Inventory'
        verbose_name_plural = 'Resource Inventory'
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"Inventory for {self.resource.name}"
    
    def save(self, *args, **kwargs):
        self.available_stock = self.current_stock - self.reserved_stock
        self.is_low_stock = self.available_stock <= self.minimum_stock_level
        super().save(*args, **kwargs)


class AllocationHistory(models.Model):
    """
    Model for tracking allocation history
    """
    allocation = models.ForeignKey(ResourceAllocation, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=50)
    description = models.TextField()
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'allocation_history'
        verbose_name = 'Allocation History'
        verbose_name_plural = 'Allocation History'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"History for {self.allocation.request.title}"
