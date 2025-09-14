#!/usr/bin/env python
"""
Test script for MongoDB Atlas connection
Run this script to test your MongoDB Atlas configuration
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

from mongodb_integration.services import mongodb_service
from django.conf import settings

def test_mongodb_connection():
    """Test MongoDB Atlas connection"""
    print("🔍 Testing MongoDB Atlas Connection...")
    print("=" * 50)
    
    # Display current configuration
    print(f"📋 Configuration:")
    print(f"   Host: {settings.MONGODB_SETTINGS['host']}")
    print(f"   Database: {settings.MONGODB_SETTINGS['db']}")
    print(f"   Port: {settings.MONGODB_SETTINGS.get('port', 'N/A')}")
    print()
    
    # Test connection
    try:
        if mongodb_service.connected:
            print("✅ MongoDB Atlas connection successful!")
            
            # Test saving a document
            test_data = {
                'report_id': 'test_atlas_001',
                'user_id': 999,
                'username': 'test_user',
                'emergency_type': 'test',
                'severity': 'low',
                'location': {'lat': 0, 'lng': 0, 'address': 'Test Location'},
                'description': 'Test document for MongoDB Atlas',
                'images': [],
                'status': 'test',
                'ai_analysis': {'test': True},
                'fraud_score': 0.0,
                'metadata': {'source': 'test_script'}
            }
            
            # Save test document
            result = mongodb_service.save_emergency_report(test_data)
            if result:
                print("✅ Test document saved successfully!")
                print(f"   Document ID: {result.id}")
                
                # Retrieve test document
                reports = mongodb_service.get_emergency_reports({'report_id': 'test_atlas_001'}, limit=1)
                if reports:
                    print("✅ Test document retrieved successfully!")
                    print(f"   Found {len(reports)} document(s)")
                else:
                    print("❌ Failed to retrieve test document")
            else:
                print("❌ Failed to save test document")
                
        else:
            print("❌ MongoDB Atlas connection failed!")
            print("   Please check your connection string and network access")
            
    except Exception as e:
        print(f"❌ Error testing MongoDB Atlas: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("   1. Check your MONGODB_ATLAS_URI in .env file")
        print("   2. Verify your Atlas cluster is running")
        print("   3. Check network access settings in Atlas")
        print("   4. Verify database user credentials")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    test_mongodb_connection()
