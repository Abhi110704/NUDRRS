from django.urls import path
from . import views

urlpatterns = [
    # Chat Sessions
    path('sessions/', views.ChatSessionListCreateView.as_view(), name='chat_sessions'),
    
    # Chat Messages
    path('sessions/<str:session_id>/messages/', views.ChatMessageListCreateView.as_view(), name='chat_messages'),
    path('sessions/<str:session_id>/history/', views.get_chat_history, name='chat_history'),
    
    # Chatbot Interaction
    path('message/', views.send_chat_message, name='send_chat_message'),
    
    # Emergency Information
    path('faq/', views.EmergencyFAQListView.as_view(), name='emergency_faq'),
    path('faq/search/', views.search_faq, name='search_faq'),
    path('contacts/', views.EmergencyContactListView.as_view(), name='emergency_contacts'),
    
    # Analytics
    path('analytics/', views.get_chatbot_analytics, name='chatbot_analytics'),
]