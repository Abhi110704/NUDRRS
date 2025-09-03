from django.urls import path
from .views import get_analytics_dashboard, get_response_metrics, get_ai_metrics

urlpatterns = [
    path('dashboard/', get_analytics_dashboard, name='analytics_dashboard'),
    path('response-metrics/', get_response_metrics, name='response_metrics'),
    path('ai-metrics/', get_ai_metrics, name='ai_metrics'),
]
