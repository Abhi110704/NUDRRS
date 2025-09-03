from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, ResourceDeploymentViewSet

router = DefaultRouter()
router.register(r'resources', ResourceViewSet)
router.register(r'deployments', ResourceDeploymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
