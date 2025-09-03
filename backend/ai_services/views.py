from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services import AIVerificationService

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
