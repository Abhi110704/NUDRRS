from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DashboardMetrics(models.Model):
    """
    Model for storing dashboard metrics
    """
    # Date and Time
    date = models.DateField()
    hour = models.IntegerField(null=True, blank=True)  # For hourly metrics
    
    # SOS Report Metrics
    total_sos_reports = models.PositiveIntegerField(default=0)
    pending_reports = models.PositiveIntegerField(default=0)
    verified_reports = models.PositiveIntegerField(default=0)
    resolved_reports = models.PositiveIntegerField(default=0)
    false_alarms = models.PositiveIntegerField(default=0)
    
    # Response Time Metrics
    average_response_time_minutes = models.FloatField(default=0)
    fastest_response_time_minutes = models.FloatField(default=0)
    slowest_response_time_minutes = models.FloatField(default=0)
    
    # Category Breakdown
    medical_emergencies = models.PositiveIntegerField(default=0)
    rescue_requests = models.PositiveIntegerField(default=0)
    shelter_requests = models.PositiveIntegerField(default=0)
    food_requests = models.PositiveIntegerField(default=0)
    evacuation_requests = models.PositiveIntegerField(default=0)
    fire_emergencies = models.PositiveIntegerField(default=0)
    flood_emergencies = models.PositiveIntegerField(default=0)
    earthquake_emergencies = models.PositiveIntegerField(default=0)
    other_emergencies = models.PositiveIntegerField(default=0)
    
    # Priority Breakdown
    low_priority = models.PositiveIntegerField(default=0)
    medium_priority = models.PositiveIntegerField(default=0)
    high_priority = models.PositiveIntegerField(default=0)
    critical_priority = models.PositiveIntegerField(default=0)
    
    # Resource Metrics
    total_resources = models.PositiveIntegerField(default=0)
    available_resources = models.PositiveIntegerField(default=0)
    allocated_resources = models.PositiveIntegerField(default=0)
    resource_utilization_percentage = models.FloatField(default=0)
    
    # User Metrics
    total_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    new_registrations = models.PositiveIntegerField(default=0)
    
    # Geographic Metrics
    reports_by_state = models.JSONField(default=dict, blank=True)
    reports_by_district = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dashboard_metrics'
        verbose_name = 'Dashboard Metrics'
        verbose_name_plural = 'Dashboard Metrics'
        ordering = ['-date', '-hour']
        unique_together = ['date', 'hour']
    
    def __str__(self):
        return f"Metrics for {self.date} {f'Hour {self.hour}' if self.hour else ''}"


class ReportAnalytics(models.Model):
    """
    Model for detailed report analytics
    """
    report = models.OneToOneField('sos_reports.SOSReport', on_delete=models.CASCADE, related_name='analytics')
    
    # AI Analysis
    ai_processing_time_ms = models.FloatField(null=True, blank=True)
    ai_confidence_score = models.FloatField(null=True, blank=True)
    ai_category_accuracy = models.BooleanField(null=True, blank=True)
    
    # Response Metrics
    first_response_time_minutes = models.FloatField(null=True, blank=True)
    resolution_time_minutes = models.FloatField(null=True, blank=True)
    number_of_updates = models.PositiveIntegerField(default=0)
    number_of_comments = models.PositiveIntegerField(default=0)
    
    # Resource Allocation
    resources_allocated = models.PositiveIntegerField(default=0)
    resources_utilized = models.PositiveIntegerField(default=0)
    
    # User Feedback
    user_satisfaction_rating = models.IntegerField(null=True, blank=True)  # 1-5 scale
    user_feedback = models.TextField(blank=True)
    
    # Geographic Analysis
    distance_from_responder_km = models.FloatField(null=True, blank=True)
    population_density = models.FloatField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'report_analytics'
        verbose_name = 'Report Analytics'
        verbose_name_plural = 'Report Analytics'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Analytics for {self.report.title}"


class SystemPerformance(models.Model):
    """
    Model for tracking system performance metrics
    """
    # Date and Time
    date = models.DateField()
    hour = models.IntegerField()
    
    # API Performance
    total_api_requests = models.PositiveIntegerField(default=0)
    successful_api_requests = models.PositiveIntegerField(default=0)
    failed_api_requests = models.PositiveIntegerField(default=0)
    average_response_time_ms = models.FloatField(default=0)
    
    # Database Performance
    database_query_count = models.PositiveIntegerField(default=0)
    slow_queries_count = models.PositiveIntegerField(default=0)
    average_query_time_ms = models.FloatField(default=0)
    
    # Server Performance
    cpu_usage_percentage = models.FloatField(default=0)
    memory_usage_percentage = models.FloatField(default=0)
    disk_usage_percentage = models.FloatField(default=0)
    
    # Error Tracking
    error_count = models.PositiveIntegerField(default=0)
    error_types = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'system_performance'
        verbose_name = 'System Performance'
        verbose_name_plural = 'System Performance'
        ordering = ['-date', '-hour']
        unique_together = ['date', 'hour']
    
    def __str__(self):
        return f"Performance for {self.date} Hour {self.hour}"


class UserActivity(models.Model):
    """
    Model for tracking user activity
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    activity_type = models.CharField(max_length=50)  # login, logout, sos_report, etc.
    activity_description = models.TextField()
    
    # Location (if applicable)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Device Information
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activity'
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.activity_type}"


class DisasterPrediction(models.Model):
    """
    Model for storing disaster predictions
    """
    PREDICTION_TYPES = [
        ('flood', 'Flood'),
        ('earthquake', 'Earthquake'),
        ('cyclone', 'Cyclone'),
        ('fire', 'Fire'),
        ('landslide', 'Landslide'),
    ]
    
    # Prediction Details
    prediction_type = models.CharField(max_length=20, choices=PREDICTION_TYPES)
    predicted_date = models.DateTimeField()
    confidence_score = models.FloatField()  # 0.0 to 1.0
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    affected_radius_km = models.FloatField()
    
    # Impact Assessment
    estimated_affected_population = models.PositiveIntegerField()
    severity_level = models.CharField(max_length=20)  # low, medium, high, severe
    
    # Model Information
    model_name = models.CharField(max_length=100)
    model_version = models.CharField(max_length=50)
    input_parameters = models.JSONField(default=dict)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    actual_occurrence = models.BooleanField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'disaster_predictions'
        verbose_name = 'Disaster Prediction'
        verbose_name_plural = 'Disaster Predictions'
        ordering = ['-predicted_date']
    
    def __str__(self):
        return f"{self.get_prediction_type_display()} prediction for {self.predicted_date}"
