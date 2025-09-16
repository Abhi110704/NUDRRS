#!/usr/bin/env python
"""
Test script for Cloudinary integration
"""
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from cloudinary_service import cloudinary_service

def test_cloudinary_connection():
    """Test Cloudinary connection and configuration"""
    print("🧪 Testing Cloudinary Integration...")
    
    # Check configuration
    print(f"Cloud Name: {settings.CLOUDINARY_CLOUD_NAME}")
    print(f"API Key: {settings.CLOUDINARY_API_KEY[:10]}..." if settings.CLOUDINARY_API_KEY else "Not set")
    print(f"API Secret: {'Set' if settings.CLOUDINARY_API_SECRET else 'Not set'}")
    
    if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        print("❌ Cloudinary credentials not configured!")
        print("Please set the following environment variables:")
        print("- CLOUDINARY_CLOUD_NAME")
        print("- CLOUDINARY_API_KEY") 
        print("- CLOUDINARY_API_SECRET")
        return False
    
    print("✅ Cloudinary credentials configured")
    return True

def test_cloudinary_upload():
    """Test Cloudinary upload functionality"""
    print("\n🧪 Testing Cloudinary Upload...")
    
    # Create a simple test image (1x1 pixel PNG)
    test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
    
    try:
        # Test upload
        result = cloudinary_service.upload_file(
            file=test_image_data,
            folder="nudrrs/test",
            filename="test_image.png",
            tags=['test', 'nudrrs']
        )
        
        if result['success']:
            print(f"✅ Upload successful!")
            print(f"   URL: {result['url']}")
            print(f"   Public ID: {result['public_id']}")
            print(f"   Format: {result.get('format')}")
            print(f"   Size: {result.get('bytes')} bytes")
            
            # Test deletion
            print("\n🧪 Testing Cloudinary Delete...")
            delete_result = cloudinary_service.delete_file(result['public_id'])
            
            if delete_result['success']:
                print("✅ Delete successful!")
            else:
                print(f"❌ Delete failed: {delete_result.get('error')}")
            
            return True
        else:
            print(f"❌ Upload failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Upload test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Cloudinary Integration Test")
    print("=" * 40)
    
    # Test connection
    if test_cloudinary_connection():
        # Test upload
        test_cloudinary_upload()
    
    print("\n" + "=" * 40)
    print("🏁 Test completed!")
