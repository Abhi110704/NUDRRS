from rest_framework import serializers
from .models import SOSReport, ReportUpdate, ReportComment, EmergencyResource


class SOSReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    reporter_phone = serializers.CharField(source='reporter.phone_number', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = SOSReport
        fields = [
            'id', 'reporter', 'reporter_name', 'reporter_phone', 'title', 'description',
            'category', 'priority', 'status', 'latitude', 'longitude', 'address',
            'landmark', 'contact_phone', 'contact_email', 'image', 'video',
            'ai_verified', 'ai_confidence', 'ai_category', 'ai_notes',
            'assigned_to', 'assigned_to_name', 'response_notes',
            'estimated_resolution_time', 'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']


class SOSReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSReport
        fields = [
            'title', 'description', 'category', 'priority', 'latitude', 'longitude',
            'address', 'landmark', 'contact_phone', 'contact_email', 'image', 'video'
        ]
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class SOSReportListSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = SOSReport
        fields = [
            'id', 'title', 'category', 'priority', 'status', 'latitude', 'longitude',
            'reporter_name', 'assigned_to_name', 'created_at', 'is_urgent'
        ]


class ReportUpdateSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportUpdate
        fields = [
            'id', 'report', 'updated_by', 'updated_by_name', 'update_type',
            'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReportCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = ReportComment
        fields = [
            'id', 'report', 'author', 'author_name', 'content',
            'is_internal', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class EmergencyResourceSerializer(serializers.ModelSerializer):
    utilization_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = EmergencyResource
        fields = [
            'id', 'name', 'resource_type', 'description', 'location_latitude',
            'location_longitude', 'capacity', 'available_capacity', 'contact_person',
            'contact_phone', 'is_available', 'utilization_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']