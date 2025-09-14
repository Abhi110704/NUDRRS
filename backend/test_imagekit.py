#!/usr/bin/env python
"""
Test script for ImageKit integration
Run this script to test your ImageKit configuration
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from imagekit_service import imagekit_service
from django.conf import settings

def test_imagekit_connection():
    """Test ImageKit connection and configuration"""
    print("🔍 Testing ImageKit Integration...")
    print("=" * 50)
    
    # Display current configuration
    print(f"📋 Configuration:")
    print(f"   Public Key: {settings.IMAGEKIT_PUBLIC_KEY[:10]}..." if settings.IMAGEKIT_PUBLIC_KEY else "   Public Key: Not configured")
    print(f"   Private Key: {'*' * 10}..." if settings.IMAGEKIT_PRIVATE_KEY else "   Private Key: Not configured")
    print(f"   URL Endpoint: {settings.IMAGEKIT_URL_ENDPOINT}")
    print()
    
    # Test ImageKit service initialization
    try:
        if imagekit_service.imagekit:
            print("✅ ImageKit service initialized successfully!")
            print("   Service is ready for image uploads")
            
            # Test URL generation (without actual file)
            print("\n🧪 Testing URL generation...")
            test_file_id = "test_file_id_123"
            
            # Test thumbnail URL generation
            thumbnail_url = imagekit_service.get_thumbnail_url(test_file_id, width=300, height=300)
            if thumbnail_url:
                print(f"✅ Thumbnail URL generation works!")
                print(f"   Example: {thumbnail_url}")
            else:
                print("❌ Thumbnail URL generation failed")
            
            # Test optimized URL generation
            optimized_url = imagekit_service.get_optimized_url(test_file_id, quality=80, format="webp")
            if optimized_url:
                print(f"✅ Optimized URL generation works!")
                print(f"   Example: {optimized_url}")
            else:
                print("❌ Optimized URL generation failed")
                
        else:
            print("❌ ImageKit service not initialized!")
            print("   Please check your credentials in .env file")
            print("\n🔧 Required environment variables:")
            print("   IMAGEKIT_PUBLIC_KEY=your_public_key")
            print("   IMAGEKIT_PRIVATE_KEY=your_private_key")
            print("   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id/")
            
    except Exception as e:
        print(f"❌ Error testing ImageKit: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("   1. Check your ImageKit credentials in .env file")
        print("   2. Verify your ImageKit account is active")
        print("   3. Check your internet connection")
        print("   4. Verify the URL endpoint format")
    
    print("\n" + "=" * 50)
    print("📚 Next steps:")
    print("   1. Set up your ImageKit credentials in .env file")
    print("   2. Test image upload via API endpoint")
    print("   3. Integrate with your frontend application")

if __name__ == "__main__":
    test_imagekit_connection()
