from rest_framework import serializers
from .models import Resource, ResourceType, ResourceDeployment

class ResourceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceType
        fields = ['id', 'name', 'description', 'icon']

class ResourceSerializer(serializers.ModelSerializer):
    resource_type = ResourceTypeSerializer(read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'name', 'resource_type', 'latitude', 'longitude', 'address', 'capacity',
            'status', 'contact_number', 'description', 'created_at', 'updated_at'
        ]

class ResourceDeploymentSerializer(serializers.ModelSerializer):
    resource = ResourceSerializer(read_only=True)
    deployed_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ResourceDeployment
        fields = [
            'id', 'resource', 'report', 'deployed_by', 'deployed_at',
            'estimated_arrival', 'actual_arrival', 'status', 'notes'
        ]
