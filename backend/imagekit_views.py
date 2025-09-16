"""
Views for ImageKit integration
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.conf import settings
from imagekit_service import imagekit_service
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """
    Upload image to ImageKit
    
    Expected payload:
    - file: Image file (multipart/form-data)
    - folder: Optional folder name (default: nudrrs)
    - tags: Optional comma-separated tags
    """
    try:
        if 'file' not in request.FILES:
            return Response({
                'success': False,
                'error': 'No file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        folder = request.data.get('folder', 'nudrrs')
        tags = request.data.get('tags', '')
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            return Response({
                'success': False,
                'error': f'Invalid file type. Allowed types: {", ".join(allowed_types)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file.size > max_size:
            return Response({
                'success': False,
                'error': 'File size too large. Maximum size is 10MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
        tag_list.extend(['nudrrs', 'emergency_report'])
        
        # Upload to ImageKit
        result = imagekit_service.upload_file(
            file=file,
            folder=folder,
            tags=tag_list
        )
        
        if result['success']:
            return Response({
                'success': True,
                'message': 'Image uploaded successfully',
                'data': {
                    'url': result['url'],
                    'file_id': result['file_id'],
                    'name': result['name'],
                    'size': result['size'],
                    'file_type': result['file_type'],
                    'tags': result['tags']
                }
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Image upload error: {e}")
        return Response({
            'success': False,
            'error': f'Upload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_base64_image(request):
    """
    Upload base64 encoded image to ImageKit
    
    Expected payload:
    - image: Base64 encoded image string
    - filename: Optional filename
    - folder: Optional folder name
    - tags: Optional comma-separated tags
    """
    try:
        data = json.loads(request.body)
        
        if 'image' not in data:
            return Response({
                'success': False,
                'error': 'No image data provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_data = data['image']
        filename = data.get('filename', 'uploaded_image.jpg')
        folder = data.get('folder', 'nudrrs')
        tags = data.get('tags', '')
        
        # Validate base64 format
        if not image_data.startswith('data:image/'):
            return Response({
                'success': False,
                'error': 'Invalid base64 image format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
        tag_list.extend(['nudrrs', 'emergency_report'])
        
        # Upload to ImageKit
        result = imagekit_service.upload_file(
            file=image_data,
            folder=folder,
            filename=filename,
            tags=tag_list
        )
        
        if result['success']:
            return Response({
                'success': True,
                'message': 'Image uploaded successfully',
                'data': {
                    'url': result['url'],
                    'file_id': result['file_id'],
                    'name': result['name'],
                    'size': result['size'],
                    'file_type': result['file_type'],
                    'tags': result['tags']
                }
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except json.JSONDecodeError:
        return Response({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Base64 image upload error: {e}")
        return Response({
            'success': False,
            'error': f'Upload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_image(request, file_id):
    """
    Delete image from ImageKit
    
    Args:
        file_id: ImageKit file ID
    """
    try:
        result = imagekit_service.delete_file(file_id)
        
        if result['success']:
            return Response({
                'success': True,
                'message': 'Image deleted successfully'
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Image deletion error: {e}")
        return Response({
            'success': False,
            'error': f'Deletion failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_image_details(request, file_id):
    """
    Get image details from ImageKit
    
    Args:
        file_id: ImageKit file ID
    """
    try:
        result = imagekit_service.get_file_details(file_id)
        
        if result['success']:
            return Response({
                'success': True,
                'data': {
                    'file_id': result['file_id'],
                    'name': result['name'],
                    'url': result['url'],
                    'size': result['size'],
                    'file_type': result['file_type'],
                    'tags': result['tags'],
                    'created_at': result['created_at']
                }
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Get image details error: {e}")
        return Response({
            'success': False,
            'error': f'Failed to get image details: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_thumbnail_url(request, file_id):
    """
    Get thumbnail URL for an image
    
    Args:
        file_id: ImageKit file ID
    Query params:
        width: Thumbnail width (default: 300)
        height: Thumbnail height (default: 300)
        crop_mode: Crop mode (default: maintain_ratio)
    """
    try:
        width = int(request.GET.get('width', 300))
        height = int(request.GET.get('height', 300))
        crop_mode = request.GET.get('crop_mode', 'maintain_ratio')
        
        thumbnail_url = imagekit_service.get_thumbnail_url(
            file_id=file_id,
            width=width,
            height=height,
            crop_mode=crop_mode
        )
        
        if thumbnail_url:
            return Response({
                'success': True,
                'thumbnail_url': thumbnail_url,
                'width': width,
                'height': height,
                'crop_mode': crop_mode
            })
        else:
            return Response({
                'success': False,
                'error': 'Failed to generate thumbnail URL'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except ValueError:
        return Response({
            'success': False,
            'error': 'Invalid width or height parameter'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Get thumbnail URL error: {e}")
        return Response({
            'success': False,
            'error': f'Failed to get thumbnail URL: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_optimized_url(request, file_id):
    """
    Get optimized image URL
    
    Args:
        file_id: ImageKit file ID
    Query params:
        quality: Image quality 1-100 (default: 80)
        format: Output format (default: auto)
    """
    try:
        quality = int(request.GET.get('quality', 80))
        format_type = request.GET.get('format', 'auto')
        
        if not (1 <= quality <= 100):
            return Response({
                'success': False,
                'error': 'Quality must be between 1 and 100'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        optimized_url = imagekit_service.get_optimized_url(
            file_id=file_id,
            quality=quality,
            format=format_type
        )
        
        if optimized_url:
            return Response({
                'success': True,
                'optimized_url': optimized_url,
                'quality': quality,
                'format': format_type
            })
        else:
            return Response({
                'success': False,
                'error': 'Failed to generate optimized URL'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except ValueError:
        return Response({
            'success': False,
            'error': 'Invalid quality parameter'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Get optimized URL error: {e}")
        return Response({
            'success': False,
            'error': f'Failed to get optimized URL: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def imagekit_status(request):
    """
    Check ImageKit service status
    """
    try:
        from imagekit_service import imagekit_service
        
        if imagekit_service.imagekit:
            return Response({
                'success': True,
                'status': 'connected',
                'message': 'ImageKit service is available',
                'url_endpoint': settings.IMAGEKIT_URL_ENDPOINT
            })
        else:
            return Response({
                'success': False,
                'status': 'not_configured',
                'message': 'ImageKit service is not configured. Please check your credentials.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
    except Exception as e:
        logger.error(f"ImageKit status check error: {e}")
        return Response({
            'success': False,
            'status': 'error',
            'message': f'Error checking ImageKit status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
