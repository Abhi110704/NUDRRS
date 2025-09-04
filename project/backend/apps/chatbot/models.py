from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatSession(models.Model):
    """
    Model for tracking chat sessions with the AI chatbot
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions', null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    language = models.CharField(max_length=10, default='en')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat_sessions'
        verbose_name = 'Chat Session'
        verbose_name_plural = 'Chat Sessions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session {self.session_id} - {self.language}"


class ChatMessage(models.Model):
    """
    Model for storing chat messages
    """
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('bot', 'Bot Response'),
        ('system', 'System Message'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    language = models.CharField(max_length=10, default='en')
    
    # For voice messages
    audio_url = models.URLField(blank=True, null=True)
    audio_duration = models.FloatField(null=True, blank=True)  # seconds
    
    # Message metadata
    intent = models.CharField(max_length=100, blank=True)  # Detected intent
    confidence = models.FloatField(null=True, blank=True)  # Intent confidence
    entities = models.JSONField(default=dict, blank=True)  # Extracted entities
    
    # Response metadata
    response_time = models.FloatField(null=True, blank=True)  # milliseconds
    model_used = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_messages'
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.get_message_type_display()} - {self.content[:50]}..."


class EmergencyFAQ(models.Model):
    """
    Model for storing frequently asked questions and answers
    """
    CATEGORIES = [
        ('general', 'General'),
        ('medical', 'Medical Emergency'),
        ('evacuation', 'Evacuation'),
        ('shelter', 'Shelter'),
        ('food', 'Food & Water'),
        ('communication', 'Communication'),
        ('safety', 'Safety Tips'),
        ('contacts', 'Emergency Contacts'),
    ]
    
    question = models.TextField()
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORIES)
    language = models.CharField(max_length=10, default='en')
    
    # For multilingual support
    translations = models.JSONField(default=dict, blank=True)
    
    # Usage tracking
    usage_count = models.PositiveIntegerField(default=0)
    last_used = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    priority = models.IntegerField(default=0)  # Higher priority shown first
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'emergency_faqs'
        verbose_name = 'Emergency FAQ'
        verbose_name_plural = 'Emergency FAQs'
        ordering = ['-priority', '-usage_count']
    
    def __str__(self):
        return f"{self.question[:50]}... - {self.get_category_display()}"


class EmergencyContact(models.Model):
    """
    Model for storing emergency contact information
    """
    CONTACT_TYPES = [
        ('police', 'Police'),
        ('fire', 'Fire Department'),
        ('medical', 'Medical Emergency'),
        ('disaster', 'Disaster Management'),
        ('rescue', 'Rescue Services'),
        ('shelter', 'Shelter'),
        ('food', 'Food Relief'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPES)
    phone_number = models.CharField(max_length=17)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    
    # Location for local contacts
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Service area
    service_area = models.CharField(max_length=200, blank=True)
    
    # Availability
    is_24_7 = models.BooleanField(default=False)
    working_hours = models.CharField(max_length=100, blank=True)
    
    # Language support
    languages_supported = models.JSONField(default=list, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chatbot_emergency_contacts'
        verbose_name = 'Emergency Contact'
        verbose_name_plural = 'Emergency Contacts'
        ordering = ['contact_type', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.get_contact_type_display()}"


class ChatbotAnalytics(models.Model):
    """
    Model for tracking chatbot usage analytics
    """
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='analytics')
    total_messages = models.PositiveIntegerField(default=0)
    user_messages = models.PositiveIntegerField(default=0)
    bot_messages = models.PositiveIntegerField(default=0)
    
    # Intent analysis
    top_intents = models.JSONField(default=dict, blank=True)
    resolved_queries = models.PositiveIntegerField(default=0)
    escalated_queries = models.PositiveIntegerField(default=0)
    
    # Performance metrics
    average_response_time = models.FloatField(null=True, blank=True)
    user_satisfaction = models.IntegerField(null=True, blank=True)  # 1-5 rating
    
    # Session duration
    session_duration = models.FloatField(null=True, blank=True)  # minutes
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chatbot_analytics'
        verbose_name = 'Chatbot Analytics'
        verbose_name_plural = 'Chatbot Analytics'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Analytics for Session {self.session.session_id}"
