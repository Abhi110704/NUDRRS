#!/usr/bin/env python
"""
Test script for MongoDB authentication
"""

import os
import sys
import django
import requests
import json

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from mongodb_integration.user_service import MongoDBUserService
from mongodb_integration.services import MongoDBService

def test_mongodb_auth():
    """Test MongoDB authentication functionality"""
    print("🧪 Testing MongoDB Authentication...")
    
    # Initialize services
    mongodb_service = MongoDBService()
    user_service = MongoDBUserService()
    
    try:
        # Connect to MongoDB
        mongodb_service.connect()
        print("✅ Connected to MongoDB")
        
        # Test 1: Create a test user
        print("\n1️⃣ Testing user creation...")
        try:
            test_user = user_service.create_user(
                username='testuser',
                email='test@example.com',
                password='testpassword123',
                first_name='Test',
                last_name='User'
            )
            print(f"✅ Created test user: {test_user.username}")
        except Exception as e:
            print(f"❌ Error creating user: {str(e)}")
            return False
        
        # Test 2: Authenticate user
        print("\n2️⃣ Testing user authentication...")
        try:
            auth_user = user_service.authenticate_user('testuser', 'testpassword123')
            if auth_user:
                print(f"✅ Authentication successful: {auth_user.username}")
            else:
                print("❌ Authentication failed")
                return False
        except Exception as e:
            print(f"❌ Error authenticating user: {str(e)}")
            return False
        
        # Test 3: Get user by token
        print("\n3️⃣ Testing token-based authentication...")
        try:
            token_user = user_service.get_user_by_token(test_user.api_token)
            if token_user:
                print(f"✅ Token authentication successful: {token_user.username}")
            else:
                print("❌ Token authentication failed")
                return False
        except Exception as e:
            print(f"❌ Error with token authentication: {str(e)}")
            return False
        
        # Test 4: Update user profile
        print("\n4️⃣ Testing profile update...")
        try:
            updated_user = user_service.update_user(
                str(test_user.id),
                phone_number='+1234567890',
                address='123 Test Street'
            )
            if updated_user:
                print(f"✅ Profile update successful: {updated_user.phone_number}")
            else:
                print("❌ Profile update failed")
                return False
        except Exception as e:
            print(f"❌ Error updating profile: {str(e)}")
            return False
        
        # Test 5: Change password
        print("\n5️⃣ Testing password change...")
        try:
            success = user_service.change_password(
                str(test_user.id),
                'testpassword123',
                'newpassword123'
            )
            if success:
                print("✅ Password change successful")
                
                # Test login with new password
                new_auth = user_service.authenticate_user('testuser', 'newpassword123')
                if new_auth:
                    print("✅ Login with new password successful")
                else:
                    print("❌ Login with new password failed")
                    return False
            else:
                print("❌ Password change failed")
                return False
        except Exception as e:
            print(f"❌ Error changing password: {str(e)}")
            return False
        
        # Test 6: Get user stats
        print("\n6️⃣ Testing user statistics...")
        try:
            stats = user_service.get_user_stats()
            print(f"✅ User stats: {stats}")
        except Exception as e:
            print(f"❌ Error getting stats: {str(e)}")
            return False
        
        # Clean up test user
        print("\n🧹 Cleaning up test user...")
        try:
            user_service.delete_user(str(test_user.id))
            print("✅ Test user deleted")
        except Exception as e:
            print(f"⚠️  Error deleting test user: {str(e)}")
        
        print("\n🎉 All MongoDB authentication tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    
    finally:
        mongodb_service.disconnect()
        print("🔌 Disconnected from MongoDB")

def test_api_endpoints():
    """Test API endpoints for MongoDB authentication"""
    print("\n🌐 Testing API endpoints...")
    
    base_url = "http://localhost:8000/api/mongodb-auth"
    
    # Test registration
    print("\n1️⃣ Testing registration endpoint...")
    try:
        register_data = {
            'username': 'apitest',
            'email': 'apitest@example.com',
            'password': 'testpass123',
            'first_name': 'API',
            'last_name': 'Test'
        }
        
        response = requests.post(f"{base_url}/register/", json=register_data)
        if response.status_code == 201:
            print("✅ Registration endpoint working")
            user_data = response.json()
            api_token = user_data['user']['api_token']
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing registration: {str(e)}")
        return False
    
    # Test login
    print("\n2️⃣ Testing login endpoint...")
    try:
        login_data = {
            'username': 'apitest',
            'password': 'testpass123'
        }
        
        response = requests.post(f"{base_url}/login/", json=login_data)
        if response.status_code == 200:
            print("✅ Login endpoint working")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing login: {str(e)}")
        return False
    
    # Test profile endpoint
    print("\n3️⃣ Testing profile endpoint...")
    try:
        headers = {'Authorization': f'Token {api_token}'}
        response = requests.get(f"{base_url}/profile/", headers=headers)
        if response.status_code == 200:
            print("✅ Profile endpoint working")
        else:
            print(f"❌ Profile failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing profile: {str(e)}")
        return False
    
    print("\n🎉 All API endpoint tests passed!")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 NUDRRS MongoDB Authentication Test")
    print("=" * 60)
    
    # Test MongoDB functionality
    mongodb_success = test_mongodb_auth()
    
    if mongodb_success:
        print("\n" + "=" * 60)
        print("🌐 Testing API Endpoints (requires running server)")
        print("=" * 60)
        print("⚠️  Make sure the Django server is running on localhost:8000")
        
        # Test API endpoints
        api_success = test_api_endpoints()
        
        if api_success:
            print("\n🎉 All tests passed! MongoDB authentication is working correctly.")
        else:
            print("\n⚠️  API tests failed. Check if the server is running.")
    else:
        print("\n💥 MongoDB tests failed. Please check the configuration.")
    
    print("=" * 60)
