from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
import uuid
from .models import ChatSession, ChatMessage, EmergencyFAQ, EmergencyContact, ChatbotAnalytics
from .serializers import (
    ChatSessionSerializer, ChatMessageSerializer, EmergencyFAQSerializer,
    EmergencyContactSerializer, ChatbotAnalyticsSerializer
)


class ChatSessionListCreateView(generics.ListCreateAPIView):
    """
    List chat sessions or create a new one
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        session_id = str(uuid.uuid4())
        serializer.save(
            user=self.request.user,
            session_id=session_id
        )


class ChatMessageListCreateView(generics.ListCreateAPIView):
    """
    List messages for a session or create a new message
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.kwargs['session_id']
        return ChatMessage.objects.filter(session__session_id=session_id)
    
    def perform_create(self, serializer):
        session_id = self.kwargs['session_id']
        session = ChatSession.objects.get(session_id=session_id)
        serializer.save(session=session)


class EmergencyFAQListView(generics.ListAPIView):
    """
    List emergency FAQs
    """
    queryset = EmergencyFAQ.objects.filter(is_active=True)
    serializer_class = EmergencyFAQSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        category = self.request.query_params.get('category')
        language = self.request.query_params.get('language', 'en')
        
        queryset = EmergencyFAQ.objects.filter(
            is_active=True,
            language=language
        )
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('-priority', '-usage_count')


class EmergencyContactListView(generics.ListAPIView):
    """
    List emergency contacts
    """
    queryset = EmergencyContact.objects.filter(is_active=True)
    serializer_class = EmergencyContactSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        contact_type = self.request.query_params.get('type')
        language = self.request.query_params.get('language', 'en')
        
        queryset = EmergencyContact.objects.filter(is_active=True)
        
        if contact_type:
            queryset = queryset.filter(contact_type=contact_type)
        
        # Filter by language support
        if language != 'en':
            queryset = queryset.filter(languages_supported__contains=[language])
        
        return queryset.order_by('contact_type', 'name')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_chat_message(request):
    """
    Send a message to the chatbot and get response
    """
    try:
        session_id = request.data.get('session_id')
        message = request.data.get('message')
        language = request.data.get('language', 'en')
        
        if not session_id or not message:
            return Response(
                {'error': 'Session ID and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create session
        session, created = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'user': request.user,
                'language': language
            }
        )
        
        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            message_type='user',
            content=message,
            language=language
        )
        
        # Generate bot response (simplified for now)
        bot_response = generate_bot_response(message, language)
        
        # Save bot response
        bot_message = ChatMessage.objects.create(
            session=session,
            message_type='bot',
            content=bot_response,
            language=language,
            intent='general',
            confidence=0.8
        )
        
        # Update session
        session.updated_at = timezone.now()
        session.save()
        
        return Response({
            'user_message': ChatMessageSerializer(user_message).data,
            'bot_message': ChatMessageSerializer(bot_message).data,
            'session_id': session_id
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_chat_history(request, session_id):
    """
    Get chat history for a session
    """
    try:
        session = ChatSession.objects.get(session_id=session_id)
        messages = ChatMessage.objects.filter(session=session).order_by('created_at')
        
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_faq(request):
    """
    Search FAQs by query
    """
    query = request.GET.get('q', '')
    language = request.GET.get('language', 'en')
    
    if not query:
        return Response([])
    
    # Simple text search (can be enhanced with full-text search)
    faqs = EmergencyFAQ.objects.filter(
        is_active=True,
        language=language,
        question__icontains=query
    ).order_by('-priority', '-usage_count')[:10]
    
    serializer = EmergencyFAQSerializer(faqs, many=True)
    return Response(serializer.data)


def generate_bot_response(message: str, language: str) -> str:
    """
    Generate bot response based on user message
    This is a simplified version - can be enhanced with AI/ML
    """
    message_lower = message.lower()
    
    # Emergency keywords
    if any(word in message_lower for word in ['emergency', 'help', 'urgent', 'sos']):
        return "I understand this is an emergency. Please call 108 immediately for medical emergencies or 100 for police. You can also submit an SOS report through our app for immediate assistance."
    
    # Weather related
    if any(word in message_lower for word in ['weather', 'rain', 'flood', 'storm']):
        return "For weather-related emergencies, please check the disaster map for current conditions. If you need immediate shelter, contact the nearest relief center."
    
    # Medical related
    if any(word in message_lower for word in ['medical', 'doctor', 'hospital', 'medicine']):
        return "For medical emergencies, call 108 immediately. For non-emergency medical assistance, I can help you find nearby hospitals and medical facilities."
    
    # General response
    return "I'm here to help with emergency information. You can ask me about emergency contacts, safety tips, or submit an SOS report if you need immediate assistance. How can I help you today?"


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_chatbot_analytics(request):
    """
    Get chatbot usage analytics
    """
    try:
        analytics = ChatbotAnalytics.objects.filter(
            session__user=request.user
        ).order_by('-created_at')[:10]
        
        serializer = ChatbotAnalyticsSerializer(analytics, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
