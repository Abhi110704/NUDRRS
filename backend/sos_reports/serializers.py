from rest_framework import serializers
from .models import SOSReport, ReportMedia, ReportUpdate

class ReportMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportMedia
        fields = ['id', 'media_type', 'file', 'ai_analysis', 'created_at']

class ReportUpdateSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ReportUpdate
        fields = ['id', 'user', 'message', 'status_change', 'created_at']

class SOSReportSerializer(serializers.ModelSerializer):
    media = ReportMediaSerializer(many=True, read_only=True)
    updates = ReportUpdateSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = SOSReport
        fields = [
            'id', 'user', 'phone_number', 'latitude', 'longitude', 'address', 'disaster_type',
            'description', 'priority', 'status', 'ai_verified', 'ai_confidence',
            'created_at', 'updated_at', 'media', 'updates'
        ]
        read_only_fields = ['ai_verified', 'ai_confidence', 'created_at', 'updated_at']

class SOSReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSReport
        fields = [
            'phone_number', 'latitude', 'longitude', 'address', 'disaster_type', 'description'
        ]
