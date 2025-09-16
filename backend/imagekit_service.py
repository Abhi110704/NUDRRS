"""
ImageKit service for handling image uploads and transformations
"""
import os
import base64
from django.conf import settings
from imagekitio import ImageKit
import logging

logger = logging.getLogger(__name__)

class ImageKitService:
    """Service class for ImageKit operations"""
    
    def __init__(self):
        self.imagekit = None
        self.initialize()
    
    def initialize(self):
        """Initialize ImageKit client"""
        try:
            if all([
                settings.IMAGEKIT_PUBLIC_KEY,
                settings.IMAGEKIT_PRIVATE_KEY,
                settings.IMAGEKIT_URL_ENDPOINT
            ]):
                self.imagekit = ImageKit(
                    public_key=settings.IMAGEKIT_PUBLIC_KEY,
                    private_key=settings.IMAGEKIT_PRIVATE_KEY,
                    url_endpoint=settings.IMAGEKIT_URL_ENDPOINT
                )
                logger.info("ImageKit initialized successfully")
            else:
                logger.warning("ImageKit credentials not configured")
        except Exception as e:
            logger.error(f"Failed to initialize ImageKit: {e}")
    
    def upload_file(self, file, folder="nudrrs", filename=None, tags=None):
        """
        Upload a file to ImageKit
        
        Args:
            file: File object or base64 string
            folder: Folder path in ImageKit
            filename: Custom filename (optional)
            tags: List of tags (optional)
        
        Returns:
            dict: Upload result with URL and file ID
        """
        try:
            if not self.imagekit:
                raise Exception("ImageKit not initialized")
            
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
                file_data = base64.b64decode(file)
                file_name = filename or "uploaded_image.jpg"
            else:
                raise ValueError("Invalid file format")
            
            # Upload file directly
            from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
            
            options = UploadFileRequestOptions(
                folder=folder,
                tags=tags or ["nudrrs", "emergency_report"],
                use_unique_file_name=True
            )
            
            result = self.imagekit.upload_file(
                file=file_data,
                file_name=file_name,
                options=options
            )
            
            # Debug logging
            logger.info(f"ImageKit upload result type: {type(result)}")
            logger.info(f"ImageKit upload result: {result}")
            
            # Handle different response formats
            if isinstance(result, dict):
                # Dictionary response
                if 'url' in result and 'fileId' in result:
                    return {
                        'success': True,
                        'url': result['url'],
                        'file_id': result['fileId'],
                        'name': result.get('name', file_name),
                        'size': result.get('size', len(file_data)),
                        'file_type': result.get('fileType', 'image/jpeg'),
                        'tags': result.get('tags', [])
                    }
                else:
                    raise Exception(f"Upload failed: {result}")
            else:
                # Object response - handle ImageKit response object
                try:
                    # Try to access attributes directly
                    if hasattr(result, 'url') and hasattr(result, 'file_id'):
                        return {
                            'success': True,
                            'url': result.url,
                            'file_id': result.file_id,
                            'name': getattr(result, 'name', file_name),
                            'size': getattr(result, 'size', len(file_data)),
                            'file_type': getattr(result, 'file_type', 'image/jpeg'),
                            'tags': getattr(result, 'tags', [])
                        }
                    # Try alternative attribute names
                    elif hasattr(result, 'url') and hasattr(result, 'fileId'):
                        return {
                            'success': True,
                            'url': result.url,
                            'file_id': result.fileId,
                            'name': getattr(result, 'name', file_name),
                            'size': getattr(result, 'size', len(file_data)),
                            'file_type': getattr(result, 'fileType', 'image/jpeg'),
                            'tags': getattr(result, 'tags', [])
                        }
                    else:
                        # Try to convert to dict
                        result_dict = result.__dict__ if hasattr(result, '__dict__') else {}
                        if 'url' in result_dict and 'fileId' in result_dict:
                            return {
                                'success': True,
                                'url': result_dict['url'],
                                'file_id': result_dict['fileId'],
                                'name': result_dict.get('name', file_name),
                                'size': result_dict.get('size', len(file_data)),
                                'file_type': result_dict.get('fileType', 'image/jpeg'),
                                'tags': result_dict.get('tags', [])
                            }
                        else:
                            raise Exception(f"Upload failed - invalid response format: {result}")
                except Exception as e:
                    logger.error(f"Error processing ImageKit response: {e}")
                    raise Exception(f"Upload failed - response processing error: {e}")
                
        except Exception as e:
            logger.error(f"ImageKit upload error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_file(self, file_id):
        """
        Delete a file from ImageKit
        
        Args:
            file_id: ImageKit file ID
        
        Returns:
            dict: Deletion result
        """
        try:
            if not self.imagekit:
                raise Exception("ImageKit not initialized")
            
            result = self.imagekit.delete_file(file_id)
            return {
                'success': True,
                'message': 'File deleted successfully'
            }
            
        except Exception as e:
            logger.error(f"ImageKit delete error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_file_details(self, file_id):
        """
        Get file details from ImageKit
        
        Args:
            file_id: ImageKit file ID
        
        Returns:
            dict: File details
        """
        try:
            if not self.imagekit:
                raise Exception("ImageKit not initialized")
            
            result = self.imagekit.get_file_details(file_id)
            return {
                'success': True,
                'file_id': result.file_id,
                'name': result.name,
                'url': result.url,
                'size': result.size,
                'file_type': result.file_type,
                'tags': result.tags,
                'created_at': result.created_at
            }
            
        except Exception as e:
            logger.error(f"ImageKit get file details error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_url(self, file_id, transformations=None):
        """
        Generate URL with transformations
        
        Args:
            file_id: ImageKit file ID
            transformations: List of transformation objects
        
        Returns:
            str: Transformed image URL
        """
        try:
            if not self.imagekit:
                raise Exception("ImageKit not initialized")
            
            url = self.imagekit.url({
                "path": f"/{file_id}",
                "transformation": transformations or []
            })
            
            return url
            
        except Exception as e:
            logger.error(f"ImageKit URL generation error: {e}")
            return None
    
    def get_thumbnail_url(self, file_id, width=300, height=300, crop_mode="maintain_ratio"):
        """
        Generate thumbnail URL
        
        Args:
            file_id: ImageKit file ID
            width: Thumbnail width
            height: Thumbnail height
            crop_mode: Crop mode (maintain_ratio, force, at_least, at_max)
        
        Returns:
            str: Thumbnail URL
        """
        transformations = [
            {
                "height": height,
                "width": width,
                "cropMode": crop_mode
            }
        ]
        
        return self.generate_url(file_id, transformations)
    
    def get_optimized_url(self, file_id, quality=80, format="auto"):
        """
        Generate optimized image URL
        
        Args:
            file_id: ImageKit file ID
            quality: Image quality (1-100)
            format: Output format (auto, jpg, png, webp)
        
        Returns:
            str: Optimized image URL
        """
        transformations = [
            {
                "quality": quality,
                "format": format
            }
        ]
        
        return self.generate_url(file_id, transformations)

# Global ImageKit service instance
imagekit_service = ImageKitService()
