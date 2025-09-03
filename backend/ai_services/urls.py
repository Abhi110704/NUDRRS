from django.urls import path
from .views import verify_image, classify_text

urlpatterns = [
    path('verify-image/', verify_image, name='verify_image'),
    path('classify-text/', classify_text, name='classify_text'),
]
