from django.urls import path
from . import views

urlpatterns = [
    path('status/', views.mongodb_status, name='mongodb_status'),
    path('reports/save/', views.save_emergency_report_mongodb, name='save_emergency_report_mongodb'),
    path('reports/', views.get_emergency_reports_mongodb, name='get_emergency_reports_mongodb'),
    path('analytics/save/', views.save_analytics_mongodb, name='save_analytics_mongodb'),
    path('reports/geospatial/', views.get_geospatial_reports, name='get_geospatial_reports'),
]
