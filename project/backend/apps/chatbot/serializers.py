from rest_framework import serializers
from .models import ChatSession, ChatMessage, EmergencyFAQ, EmergencyContact, ChatbotAnalytics


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = [
            'id', 'session_id', 'language', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session', 'message_type', 'content', 'language',
            'audio_url', 'audio_duration', 'intent', 'confidence',
            'entities', 'response_time', 'model_used', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EmergencyFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyFAQ
        fields = [
            'id', 'question', 'answer', 'category', 'language',
            'translations', 'usage_count', 'last_used', 'tags',
            'priority', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = [
            'id', 'name', 'contact_type', 'phone_number', 'email',
            'address', 'latitude', 'longitude', 'service_area',
            'is_24_7', 'working_hours', 'languages_supported',
            'is_active', 'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChatbotAnalyticsSerializer(serializers.ModelSerializer):
    session_id = serializers.CharField(source='session.session_id', read_only=True)
    
    class Meta:
        model = ChatbotAnalytics
        fields = [
            'id', 'session', 'session_id', 'total_messages', 'user_messages',
            'bot_messages', 'top_intents', 'resolved_queries', 'escalated_queries',
            'average_response_time', 'user_satisfaction', 'session_duration',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
