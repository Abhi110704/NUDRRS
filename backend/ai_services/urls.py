from django.urls import path
from .views import verify_image, classify_text, generate_ai_description, generate_description_from_context, enhance_description, analyze_emergency, get_description_suggestions

urlpatterns = [
    path('verify-image/', verify_image, name='verify_image'),
    path('classify-text/', classify_text, name='classify_text'),
    path('generate-ai-description/', generate_ai_description, name='generate_ai_description'),
    path('generate-description/', generate_description_from_context, name='generate_description_from_context'),
    path('enhance-description/', enhance_description, name='enhance_description'),
    path('analyze-emergency/', analyze_emergency, name='analyze_emergency'),
    path('description-suggestions/', get_description_suggestions, name='get_description_suggestions'),
]
