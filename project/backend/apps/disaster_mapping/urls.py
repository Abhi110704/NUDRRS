from django.urls import path
from . import views

urlpatterns = [
    # Disaster Zones
    path('zones/', views.DisasterZoneListCreateView.as_view(), name='disaster_zones'),
    path('zones/<int:pk>/', views.DisasterZoneDetailView.as_view(), name='disaster_zone_detail'),
    
    # Weather Data
    path('weather/', views.WeatherDataListView.as_view(), name='weather_data'),
    path('weather/forecast/', views.weather_forecast, name='weather_forecast'),
    
    # Satellite Images
    path('zones/<int:zone_id>/images/', views.SatelliteImageListView.as_view(), name='satellite_images'),
    
    # Predictions
    path('zones/<int:zone_id>/predictions/', views.PredictionModelListView.as_view(), name='predictions'),
    
    # Evacuation Routes
    path('zones/<int:zone_id>/routes/', views.EvacuationRouteListView.as_view(), name='evacuation_routes'),
    
    # Heatmap Data
    path('heatmap/', views.disaster_heatmap_data, name='disaster_heatmap'),
]