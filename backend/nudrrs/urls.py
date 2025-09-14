from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
from sos_reports.admin import emergency_dashboard_view

urlpatterns = [
    path('', views.api_overview, name='api_overview'),
    path('api/', views.api_overview, name='api_root'),
    path('admin/emergency-dashboard/', emergency_dashboard_view, name='emergency_dashboard'),
    path('admin/', admin.site.urls),
    path('health/', views.health_check, name='health_check'),
    path('api/auth/', include('authentication.urls')),
    path('api/mongodb-auth/', include('mongodb_integration.auth_urls')),
    path('api/sos_reports/', include('sos_reports.urls')),
    path('api/ai/', include('ai_services.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/mongodb/', include('mongodb_integration.urls')),
    # path('api/imagekit/', include('imagekit_urls')),  # Temporarily disabled
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
