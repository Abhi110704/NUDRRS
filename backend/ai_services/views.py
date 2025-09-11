from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services import AIVerificationService
import os
import tempfile

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_image(request):
    """API endpoint to verify uploaded images"""
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Save temporary file
    temp_path = f'/tmp/{image_file.name}'
    with open(temp_path, 'wb+') as destination:
        for chunk in image_file.chunks():
            destination.write(chunk)
    
    # Verify image
    ai_service = AIVerificationService()
    result = ai_service.verify_image(temp_path)
    
    return Response(result)

@api_view(['POST'])
@permission_classes([AllowAny])
def classify_text(request):
    """API endpoint to classify emergency text"""
    text = request.data.get('text', '')
    
    if not text:
        return Response({'error': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    ai_service = AIVerificationService()
    result = ai_service.classify_text(text)
    
    return Response(result)

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_ai_description(request):
    """API endpoint to generate AI description from image"""
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    disaster_type = request.data.get('disaster_type', None)
    location = request.data.get('location', None)
    
    # Save temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
        for chunk in image_file.chunks():
            temp_file.write(chunk)
        temp_path = temp_file.name
    
    try:
        # Generate AI description
        ai_service = AIVerificationService()
        result = ai_service.generate_ai_description(temp_path, disaster_type, location)
        
        return Response(result)
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)

@api_view(['POST'])
@permission_classes([AllowAny])
def enhance_description(request):
    """API endpoint to enhance user description using AI"""
    user_description = request.data.get('description', '')
    disaster_type = request.data.get('disaster_type', None)
    location = request.data.get('location', None)
    
    if not user_description:
        return Response({'error': 'No description provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Enhance description using AI
    ai_service = AIVerificationService()
    result = ai_service.enhance_description(user_description, disaster_type, location)
    
    return Response(result)

@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_emergency(request):
    """API endpoint for comprehensive emergency analysis"""
    text_description = request.data.get('description', '')
    disaster_type = request.data.get('disaster_type', None)
    location = request.data.get('location', None)
    image_paths = []
    
    # Handle uploaded images
    if 'images' in request.FILES:
        temp_paths = []
        for image_file in request.FILES.getlist('images'):
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                for chunk in image_file.chunks():
                    temp_file.write(chunk)
                temp_paths.append(temp_file.name)
        image_paths = temp_paths
    
    try:
        # Perform comprehensive analysis
        ai_service = AIVerificationService()
        result = ai_service.analyze_report(
            text_description=text_description,
            image_paths=image_paths,
            disaster_type=disaster_type,
            location=location
        )
        
        return Response(result)
    finally:
        # Clean up temporary files
        for temp_path in image_paths:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_description_suggestions(request):
    """API endpoint to get disaster-specific description suggestions"""
    disaster_type = request.GET.get('disaster_type', None)
    location = request.GET.get('location', None)
    
    if not disaster_type:
        return Response({'error': 'Disaster type is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        ai_service = AIVerificationService()
        suggestions = ai_service.get_disaster_suggestions(disaster_type, location)
        
        return Response(suggestions)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
