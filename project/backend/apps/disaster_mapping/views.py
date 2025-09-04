from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import DisasterZone, WeatherData, SatelliteImage, PredictionModel, EvacuationRoute
from .serializers import (
    DisasterZoneSerializer, WeatherDataSerializer, SatelliteImageSerializer,
    PredictionModelSerializer, EvacuationRouteSerializer
)


class DisasterZoneListCreateView(generics.ListCreateAPIView):
    """
    List all disaster zones or create a new one
    """
    queryset = DisasterZone.objects.filter(is_active=True)
    serializer_class = DisasterZoneSerializer
    permission_classes = [permissions.IsAuthenticated]


class DisasterZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a disaster zone
    """
    queryset = DisasterZone.objects.all()
    serializer_class = DisasterZoneSerializer
    permission_classes = [permissions.IsAuthenticated]


class WeatherDataListView(generics.ListAPIView):
    """
    List weather data for a specific location
    """
    serializer_class = WeatherDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        
        if lat and lng:
            return WeatherData.objects.filter(
                location_latitude__range=[float(lat) - 0.1, float(lat) + 0.1],
                location_longitude__range=[float(lng) - 0.1, float(lng) + 0.1]
            ).order_by('-recorded_at')[:10]
        
        return WeatherData.objects.none()


class SatelliteImageListView(generics.ListAPIView):
    """
    List satellite images for a disaster zone
    """
    serializer_class = SatelliteImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        zone_id = self.kwargs.get('zone_id')
        if zone_id:
            return SatelliteImage.objects.filter(disaster_zone_id=zone_id)
        return SatelliteImage.objects.none()


class PredictionModelListView(generics.ListAPIView):
    """
    List prediction models for disaster zones
    """
    serializer_class = PredictionModelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        zone_id = self.kwargs.get('zone_id')
        if zone_id:
            return PredictionModel.objects.filter(disaster_zone_id=zone_id)
        return PredictionModel.objects.none()


class EvacuationRouteListView(generics.ListAPIView):
    """
    List evacuation routes for a disaster zone
    """
    serializer_class = EvacuationRouteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        zone_id = self.kwargs.get('zone_id')
        if zone_id:
            return EvacuationRoute.objects.filter(
                disaster_zone_id=zone_id, 
                is_active=True
            )
        return EvacuationRoute.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def disaster_heatmap_data(request):
    """
    Get disaster heatmap data for visualization
    """
    try:
        # Get active disaster zones
        zones = DisasterZone.objects.filter(is_active=True)
        
        heatmap_data = []
        for zone in zones:
            heatmap_data.append({
                'id': zone.id,
                'name': zone.name,
                'type': zone.disaster_type,
                'severity': zone.severity,
                'center_lat': float(zone.center_latitude),
                'center_lng': float(zone.center_longitude),
                'affected_population': zone.estimated_affected_population,
                'start_time': zone.start_time,
                'is_predicted': zone.is_predicted
            })
        
        return Response(heatmap_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weather_forecast(request):
    """
    Get weather forecast for a specific location
    """
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    
    if not lat or not lng:
        return Response(
            {'error': 'Latitude and longitude are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get recent weather data for the location
        weather_data = WeatherData.objects.filter(
            location_latitude__range=[float(lat) - 0.1, float(lat) + 0.1],
            location_longitude__range=[float(lng) - 0.1, float(lng) + 0.1]
        ).order_by('-recorded_at').first()
        
        if weather_data:
            serializer = WeatherDataSerializer(weather_data)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'No weather data available for this location'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except ValueError:
        return Response(
            {'error': 'Invalid coordinates'},
            status=status.HTTP_400_BAD_REQUEST
        )
