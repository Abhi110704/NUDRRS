from rest_framework import serializers
from .models import DisasterZone, WeatherData, SatelliteImage, PredictionModel, EvacuationRoute


class DisasterZoneSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = DisasterZone
        fields = [
            'id', 'name', 'disaster_type', 'severity', 'description',
            'boundary_coordinates', 'center_latitude', 'center_longitude',
            'estimated_affected_population', 'affected_areas', 'start_time',
            'predicted_end_time', 'actual_end_time', 'is_active', 'is_predicted',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = [
            'id', 'location_latitude', 'location_longitude', 'location_name',
            'temperature', 'humidity', 'wind_speed', 'wind_direction',
            'pressure', 'precipitation', 'weather_condition', 'visibility',
            'recorded_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SatelliteImageSerializer(serializers.ModelSerializer):
    disaster_zone_name = serializers.CharField(source='disaster_zone.name', read_only=True)
    
    class Meta:
        model = SatelliteImage
        fields = [
            'id', 'disaster_zone', 'disaster_zone_name', 'image_type',
            'image_url', 'thumbnail_url', 'coverage_bounds', 'resolution',
            'acquisition_date', 'satellite_name', 'analysis_notes',
            'damage_assessment', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PredictionModelSerializer(serializers.ModelSerializer):
    disaster_zone_name = serializers.CharField(source='disaster_zone.name', read_only=True)
    
    class Meta:
        model = PredictionModel
        fields = [
            'id', 'disaster_zone', 'disaster_zone_name', 'prediction_type',
            'prediction_data', 'confidence_score', 'model_name', 'model_version',
            'input_parameters', 'predicted_at', 'valid_until', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EvacuationRouteSerializer(serializers.ModelSerializer):
    disaster_zone_name = serializers.CharField(source='disaster_zone.name', read_only=True)
    
    class Meta:
        model = EvacuationRoute
        fields = [
            'id', 'disaster_zone', 'disaster_zone_name', 'name', 'description',
            'route_coordinates', 'distance_km', 'estimated_travel_time',
            'capacity', 'difficulty_level', 'is_safe', 'safety_notes',
            'alternative_routes', 'is_active', 'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_updated']
