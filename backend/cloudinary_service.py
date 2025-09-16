"""
Cloudinary service for handling image uploads and transformations
"""
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CloudinaryService:
    """Service class for Cloudinary operations"""
    
    def __init__(self):
        self.cloudinary = None
        self.initialize()
    
    def initialize(self):
        """Initialize Cloudinary client"""
        try:
            if all([
                settings.CLOUDINARY_CLOUD_NAME,
                settings.CLOUDINARY_API_KEY,
                settings.CLOUDINARY_API_SECRET
            ]):
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                    api_key=settings.CLOUDINARY_API_KEY,
                    api_secret=settings.CLOUDINARY_API_SECRET,
                    secure=True
                )
                logger.info("Cloudinary initialized successfully")
            else:
                logger.warning("Cloudinary credentials not configured")
        except Exception as e:
            logger.error(f"Failed to initialize Cloudinary: {e}")
    
    def upload_file(self, file, folder="nudrrs", filename=None, tags=None):
        """
        Upload a file to Cloudinary
        
        Args:
            file: File object or base64 string
            folder: Folder path in Cloudinary
            filename: Custom filename (optional)
            tags: List of tags (optional)
        
        Returns:
            dict: Upload result with URL and public_id
        """
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                raise Exception("Cloudinary not initialized")
            
            # Prepare file data
            if hasattr(file, 'read'):
                # Django file object - reset file pointer to beginning
                file.seek(0)
                file_data = file.read()
                file_name = filename or file.name
                # Reset file pointer again for any subsequent reads
                file.seek(0)
            elif isinstance(file, bytes):
                # Raw bytes data
                file_data = file
                file_name = filename or "uploaded_image.jpg"
            elif isinstance(file, str):
                # Base64 string
                file_data = file
                file_name = filename or "uploaded_image.jpg"
            else:
                raise ValueError("Unsupported file type")
            
            # Prepare upload options
            upload_options = {
                'folder': folder,
                'resource_type': 'auto',  # Automatically detect image/video
                'quality': 'auto',  # Automatic quality optimization
                'fetch_format': 'auto',  # Automatic format optimization
            }
            
            if tags:
                upload_options['tags'] = tags
            
            if filename:
                upload_options['public_id'] = filename
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file_data,
                **upload_options
            )
            
            return {
                'success': True,
                'url': result['secure_url'],
                'public_id': result['public_id'],
                'format': result['format'],
                'width': result.get('width'),
                'height': result.get('height'),
                'bytes': result.get('bytes'),
                'created_at': result.get('created_at'),
                'file_id': result['public_id'],  # For compatibility with existing code
                'imagekit_url': result['secure_url'],  # For compatibility
                'file_url': result['secure_url'],  # For compatibility
                'image_url': result['secure_url'],  # For compatibility
            }
            
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'url': None,
                'public_id': None
            }
    
    def delete_file(self, public_id):
        """
        Delete a file from Cloudinary
        
        Args:
            public_id: Cloudinary public ID of the file to delete
        
        Returns:
            dict: Deletion result
        """
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                raise Exception("Cloudinary not initialized")
            
            result = cloudinary.uploader.destroy(public_id)
            
            return {
                'success': result.get('result') == 'ok',
                'result': result.get('result'),
                'public_id': public_id
            }
            
        except Exception as e:
            logger.error(f"Cloudinary deletion failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'public_id': public_id
            }
    
    def get_file_info(self, public_id):
        """
        Get information about a file in Cloudinary
        
        Args:
            public_id: Cloudinary public ID
        
        Returns:
            dict: File information
        """
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                raise Exception("Cloudinary not initialized")
            
            result = cloudinary.api.resource(public_id)
            
            return {
                'success': True,
                'public_id': result['public_id'],
                'url': result['secure_url'],
                'format': result['format'],
                'width': result.get('width'),
                'height': result.get('height'),
                'bytes': result.get('bytes'),
                'created_at': result.get('created_at'),
                'tags': result.get('tags', [])
            }
            
        except Exception as e:
            logger.error(f"Cloudinary get info failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'public_id': public_id
            }
    
    def transform_url(self, public_id, transformations=None):
        """
        Generate a transformed URL for an image
        
        Args:
            public_id: Cloudinary public ID
            transformations: Dict of transformation options
        
        Returns:
            str: Transformed URL
        """
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                raise Exception("Cloudinary not initialized")
            
            if transformations is None:
                transformations = {}
            
            url = cloudinary.utils.cloudinary_url(public_id, **transformations)[0]
            return url
            
        except Exception as e:
            logger.error(f"Cloudinary transform URL failed: {e}")
            return None

# Create a global instance
cloudinary_service = CloudinaryService()
