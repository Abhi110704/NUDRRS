from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Resource, ResourceDeployment, ResourceType
from .serializers import ResourceSerializer, ResourceDeploymentSerializer
import math

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 50)  # km
        resource_type = request.query_params.get('type')
        
        if not lat or not lng:
            return Response({'error': 'lat and lng parameters required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Simple distance calculation using Haversine formula
        lat = float(lat)
        lng = float(lng)
        radius = float(radius)
        
        # Convert radius from km to degrees (approximate)
        lat_range = radius / 111.0  # 1 degree lat ≈ 111 km
        lng_range = radius / (111.0 * math.cos(math.radians(lat)))
        
        resources = Resource.objects.filter(
            latitude__range=(lat - lat_range, lat + lat_range),
            longitude__range=(lng - lng_range, lng + lng_range),
            status='AVAILABLE'
        )
        
        if resource_type:
            resources = resources.filter(resource_type__name=resource_type)
        
        serializer = self.get_serializer(resources, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deploy(self, request, pk=None):
        resource = self.get_object()
        report_id = request.data.get('report_id')
        
        if not report_id:
            return Response({'error': 'report_id is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if resource.status != 'AVAILABLE':
            return Response({'error': 'Resource is not available'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create deployment
        deployment = ResourceDeployment.objects.create(
            resource=resource,
            report_id=report_id,
            deployed_by=request.user
        )
        
        # Update resource status
        resource.status = 'DEPLOYED'
        resource.save()
        
        return Response({'message': 'Resource deployed successfully'})

class ResourceDeploymentViewSet(viewsets.ModelViewSet):
    queryset = ResourceDeployment.objects.all()
    serializer_class = ResourceDeploymentSerializer
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        deployment = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        deployment.status = new_status
        deployment.notes = notes
        deployment.save()
        
        # If deployment is completed, make resource available again
        if new_status == 'COMPLETED':
            deployment.resource.status = 'AVAILABLE'
            deployment.resource.save()
        
        return Response({'message': 'Deployment status updated'})
