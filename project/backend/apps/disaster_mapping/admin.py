from django.contrib import admin
from .models import DisasterZone, WeatherData, SatelliteImage, PredictionModel, EvacuationRoute


@admin.register(DisasterZone)
class DisasterZoneAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'disaster_type', 'severity', 'is_active', 'is_predicted',
        'estimated_affected_population', 'start_time', 'created_at'
    ]
    list_filter = [
        'disaster_type', 'severity', 'is_active', 'is_predicted', 'created_at'
    ]
    search_fields = ['name', 'description', 'affected_areas']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'disaster_type', 'severity', 'description')
        }),
        ('Location', {
            'fields': ('boundary_coordinates', 'center_latitude', 'center_longitude')
        }),
        ('Impact', {
            'fields': ('estimated_affected_population', 'affected_areas')
        }),
        ('Timeline', {
            'fields': ('start_time', 'predicted_end_time', 'actual_end_time')
        }),
        ('Status', {
            'fields': ('is_active', 'is_predicted', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = [
        'location_name', 'temperature', 'humidity', 'wind_speed',
        'weather_condition', 'recorded_at'
    ]
    list_filter = ['weather_condition', 'recorded_at']
    search_fields = ['location_name']
    readonly_fields = ['created_at']


@admin.register(SatelliteImage)
class SatelliteImageAdmin(admin.ModelAdmin):
    list_display = [
        'disaster_zone', 'image_type', 'acquisition_date',
        'satellite_name', 'resolution'
    ]
    list_filter = ['image_type', 'acquisition_date', 'satellite_name']
    search_fields = ['disaster_zone__name', 'satellite_name']
    readonly_fields = ['created_at']


@admin.register(PredictionModel)
class PredictionModelAdmin(admin.ModelAdmin):
    list_display = [
        'disaster_zone', 'prediction_type', 'model_name',
        'confidence_score', 'predicted_at', 'valid_until'
    ]
    list_filter = ['prediction_type', 'model_name', 'predicted_at']
    search_fields = ['disaster_zone__name', 'model_name']
    readonly_fields = ['created_at']


@admin.register(EvacuationRoute)
class EvacuationRouteAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'disaster_zone', 'distance_km', 'capacity',
        'difficulty_level', 'is_safe', 'is_active'
    ]
    list_filter = ['difficulty_level', 'is_safe', 'is_active', 'created_at']
    search_fields = ['name', 'disaster_zone__name', 'description']
    readonly_fields = ['created_at', 'last_updated']
