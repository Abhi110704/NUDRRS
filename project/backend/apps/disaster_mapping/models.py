from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class DisasterZone(models.Model):
    """
    Model for disaster zones and affected areas
    """
    DISASTER_TYPES = [
        ('flood', 'Flood'),
        ('earthquake', 'Earthquake'),
        ('cyclone', 'Cyclone'),
        ('fire', 'Fire'),
        ('landslide', 'Landslide'),
        ('heatwave', 'Heatwave'),
        ('coldwave', 'Coldwave'),
        ('drought', 'Drought'),
        ('other', 'Other'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('severe', 'Severe'),
        ('extreme', 'Extreme'),
    ]
    
    name = models.CharField(max_length=200)
    disaster_type = models.CharField(max_length=20, choices=DISASTER_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    description = models.TextField()
    
    # Geographic boundaries (polygon coordinates)
    boundary_coordinates = models.JSONField()  # Array of lat/lng points
    
    # Center point for map display
    center_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    center_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Affected population and infrastructure
    estimated_affected_population = models.PositiveIntegerField(default=0)
    affected_areas = models.TextField(blank=True)
    
    # Timeline
    start_time = models.DateTimeField()
    predicted_end_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_predicted = models.BooleanField(default=False)  # AI prediction vs actual
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'disaster_zones'
        verbose_name = 'Disaster Zone'
        verbose_name_plural = 'Disaster Zones'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_disaster_type_display()} ({self.get_severity_display()})"


class WeatherData(models.Model):
    """
    Model for storing weather data from external APIs
    """
    location_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_name = models.CharField(max_length=200)
    
    # Weather parameters
    temperature = models.FloatField()  # Celsius
    humidity = models.FloatField()  # Percentage
    wind_speed = models.FloatField()  # km/h
    wind_direction = models.FloatField()  # Degrees
    pressure = models.FloatField()  # hPa
    precipitation = models.FloatField(default=0)  # mm
    
    # Weather conditions
    weather_condition = models.CharField(max_length=100)  # Rain, Clear, etc.
    visibility = models.FloatField(null=True, blank=True)  # km
    
    # Timestamps
    recorded_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'weather_data'
        verbose_name = 'Weather Data'
        verbose_name_plural = 'Weather Data'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"Weather at {self.location_name} - {self.recorded_at}"


class SatelliteImage(models.Model):
    """
    Model for storing satellite imagery data
    """
    IMAGE_TYPES = [
        ('optical', 'Optical'),
        ('radar', 'Radar'),
        ('infrared', 'Infrared'),
        ('multispectral', 'Multispectral'),
    ]
    
    disaster_zone = models.ForeignKey(DisasterZone, on_delete=models.CASCADE, related_name='satellite_images')
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPES)
    image_url = models.URLField()
    thumbnail_url = models.URLField(blank=True)
    
    # Geographic coverage
    coverage_bounds = models.JSONField()  # Bounding box coordinates
    
    # Image metadata
    resolution = models.CharField(max_length=50, blank=True)  # e.g., "10m"
    acquisition_date = models.DateTimeField()
    satellite_name = models.CharField(max_length=100, blank=True)
    
    # Analysis results
    analysis_notes = models.TextField(blank=True)
    damage_assessment = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'satellite_images'
        verbose_name = 'Satellite Image'
        verbose_name_plural = 'Satellite Images'
        ordering = ['-acquisition_date']
    
    def __str__(self):
        return f"{self.get_image_type_display()} image for {self.disaster_zone.name}"


class PredictionModel(models.Model):
    """
    Model for storing AI/ML prediction results
    """
    PREDICTION_TYPES = [
        ('flood_risk', 'Flood Risk'),
        ('fire_spread', 'Fire Spread'),
        ('cyclone_path', 'Cyclone Path'),
        ('earthquake_probability', 'Earthquake Probability'),
        ('evacuation_route', 'Evacuation Route'),
    ]
    
    disaster_zone = models.ForeignKey(DisasterZone, on_delete=models.CASCADE, related_name='predictions')
    prediction_type = models.CharField(max_length=30, choices=PREDICTION_TYPES)
    
    # Prediction data
    prediction_data = models.JSONField()  # Model-specific prediction results
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    # Model information
    model_name = models.CharField(max_length=100)
    model_version = models.CharField(max_length=50)
    input_parameters = models.JSONField(default=dict)
    
    # Timestamps
    predicted_at = models.DateTimeField()
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'prediction_models'
        verbose_name = 'Prediction Model'
        verbose_name_plural = 'Prediction Models'
        ordering = ['-predicted_at']
    
    def __str__(self):
        return f"{self.get_prediction_type_display()} for {self.disaster_zone.name}"


class EvacuationRoute(models.Model):
    """
    Model for evacuation routes and safe zones
    """
    disaster_zone = models.ForeignKey(DisasterZone, on_delete=models.CASCADE, related_name='evacuation_routes')
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Route coordinates
    route_coordinates = models.JSONField()  # Array of lat/lng points
    
    # Route properties
    distance_km = models.FloatField()
    estimated_travel_time = models.IntegerField()  # minutes
    capacity = models.PositiveIntegerField()  # number of people
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('difficult', 'Difficult'),
        ('extreme', 'Extreme'),
    ])
    
    # Safety information
    is_safe = models.BooleanField(default=True)
    safety_notes = models.TextField(blank=True)
    alternative_routes = models.JSONField(default=list, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'evacuation_routes'
        verbose_name = 'Evacuation Route'
        verbose_name_plural = 'Evacuation Routes'
        ordering = ['distance_km']
    
    def __str__(self):
        return f"{self.name} - {self.disaster_zone.name}"
