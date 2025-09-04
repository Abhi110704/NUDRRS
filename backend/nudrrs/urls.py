from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.api_overview, name='api_overview'),
    path('admin/', admin.site.urls),
    path('health/', views.health_check, name='health_check'),
    path('api/auth/', include('authentication.urls')),
    path('api/reports/', include('sos_reports.urls')),
    path('api/ai/', include('ai_services.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/analytics/', include('analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
