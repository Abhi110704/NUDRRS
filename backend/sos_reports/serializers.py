from rest_framework import serializers
from .models import SOSReport, ReportMedia, ReportUpdate, ReportVote

class ReportMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    class Meta:
        model = ReportMedia
        fields = ['id', 'media_type', 'file', 'file_url', 'ai_analysis', 'created_at']

class ReportUpdateSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ReportUpdate
        fields = ['id', 'user', 'message', 'status_change', 'created_at']

class SOSReportSerializer(serializers.ModelSerializer):
    media = ReportMediaSerializer(many=True, read_only=True)
    updates = ReportUpdateSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    vote_counts = serializers.SerializerMethodField()
    vote_percentages = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email
            }
        return None
    
    def get_vote_counts(self, obj):
        return obj.get_vote_counts()
    
    def get_vote_percentages(self, obj):
        return obj.get_vote_percentages()
    
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_vote = obj.votes.filter(user=request.user).first()
            return user_vote.vote_type if user_vote else None
        return None
    
    class Meta:
        model = SOSReport
        fields = [
            'id', 'user', 'phone_number', 'latitude', 'longitude', 'address', 'disaster_type',
            'description', 'priority', 'status', 'ai_verified', 'ai_confidence', 'ai_fraud_score', 'ai_analysis_data',
            'created_at', 'updated_at', 'media', 'updates', 'vote_counts', 'vote_percentages', 'user_vote'
        ]
        read_only_fields = ['ai_verified', 'ai_confidence', 'ai_fraud_score', 'ai_analysis_data', 'created_at', 'updated_at']

class SOSReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSReport
        fields = [
            'phone_number', 'latitude', 'longitude', 'address', 'disaster_type', 'description', 'priority'
        ]

class ReportUpdateSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportUpdate
        fields = ['id', 'user', 'message', 'status_change', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'username': obj.user.username
            }
        return None

class ReportVoteSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportVote
        fields = ['id', 'user', 'vote_type', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'username': obj.user.username
            }
        return None
