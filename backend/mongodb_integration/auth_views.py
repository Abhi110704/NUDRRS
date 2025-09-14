from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import datetime
import json

from .user_service import MongoDBUserService
from .services import MongoDBService

class MongoDBAuthViews:
    """
    Authentication views using MongoDB instead of SQLite
    """
    
    def __init__(self):
        self.user_service = MongoDBUserService()
        self.mongodb_service = MongoDBService()
    
    @api_view(['POST'])
    @permission_classes([AllowAny])
    def register_user(self, request):
        """Register a new user in MongoDB"""
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['username', 'email', 'password']
            for field in required_fields:
                if not data.get(field):
                    return Response({
                        'error': f'{field} is required'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = self.user_service.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone_number=data.get('phone_number', ''),
                emergency_contact=data.get('emergency_contact', ''),
                address=data.get('address', '')
            )
            
            return Response({
                'message': 'User created successfully',
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'api_token': user.api_token
                }
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @api_view(['POST'])
    @permission_classes([AllowAny])
    def login_user(self, request):
        """Login user and return API token"""
        try:
            data = request.data
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return Response({
                    'error': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Authenticate user
            user = self.user_service.authenticate_user(username, password)
            
            if not user:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                return Response({
                    'error': 'Account is deactivated'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                'message': 'Login successful',
                'token': user.api_token,
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'last_login': user.last_login.isoformat() if user.last_login else None
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @api_view(['POST'])
    def logout_user(self, request):
        """Logout user (invalidate token)"""
        try:
            # For MongoDB, we can either delete the token or mark it as invalid
            # For simplicity, we'll regenerate the token
            user = self.user_service.get_user_by_token(request.META.get('HTTP_AUTHORIZATION', '').replace('Token ', ''))
            
            if user:
                # Generate new token (invalidates old one)
                new_token = self.user_service.reset_api_token(str(user.id))
                return Response({
                    'message': 'Logout successful'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid token'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            return Response({
                'error': f'Logout failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @api_view(['GET'])
    def get_user_profile(self, request):
        """Get current user profile"""
        try:
            token = request.META.get('HTTP_AUTHORIZATION', '').replace('Token ', '')
            user = self.user_service.get_user_by_token(token)
            
            if not user:
                return Response({
                    'error': 'Invalid token'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone_number': user.phone_number,
                    'emergency_contact': user.emergency_contact,
                    'address': user.address,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'date_joined': user.date_joined.isoformat(),
                    'last_login': user.last_login.isoformat() if user.last_login else None
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @api_view(['PUT'])
    def update_user_profile(self, request):
        """Update user profile"""
        try:
            token = request.META.get('HTTP_AUTHORIZATION', '').replace('Token ', '')
            user = self.user_service.get_user_by_token(token)
            
            if not user:
                return Response({
                    'error': 'Invalid token'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Update user data
            update_data = {}
            allowed_fields = ['first_name', 'last_name', 'phone_number', 'emergency_contact', 'address']
            
            for field in allowed_fields:
                if field in request.data:
                    update_data[field] = request.data[field]
            
            if update_data:
                updated_user = self.user_service.update_user(str(user.id), **update_data)
                
                return Response({
                    'message': 'Profile updated successfully',
                    'user': {
                        'id': str(updated_user.id),
                        'username': updated_user.username,
                        'email': updated_user.email,
                        'first_name': updated_user.first_name,
                        'last_name': updated_user.last_name,
                        'phone_number': updated_user.phone_number,
                        'emergency_contact': updated_user.emergency_contact,
                        'address': updated_user.address
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'No valid fields to update'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Failed to update profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @api_view(['POST'])
    def change_password(self, request):
        """Change user password"""
        try:
            token = request.META.get('HTTP_AUTHORIZATION', '').replace('Token ', '')
            user = self.user_service.get_user_by_token(token)
            
            if not user:
                return Response({
                    'error': 'Invalid token'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')
            
            if not old_password or not new_password:
                return Response({
                    'error': 'Old password and new password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = self.user_service.change_password(str(user.id), old_password, new_password)
            
            if success:
                return Response({
                    'message': 'Password changed successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid old password'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Failed to change password: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Create instance for use in URLs
mongodb_auth = MongoDBAuthViews()
