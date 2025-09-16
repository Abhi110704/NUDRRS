from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from .models import UserProfile, Organization
from .mongodb_service import auth_mongodb_service
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer, UserProfileSerializer, 
    ChangePasswordSerializer, PasswordResetSerializer, OrganizationSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Prepare user data for MongoDB
            user_data = {
                'username': serializer.validated_data['username'],
                'email': serializer.validated_data['email'],
                'password': serializer.validated_data['password'],
                'first_name': serializer.validated_data.get('first_name', ''),
                'last_name': serializer.validated_data.get('last_name', ''),
                'role': serializer.validated_data.get('role', 'VIEWER'),
                'organization': serializer.validated_data.get('organization', ''),
                'phone_number': serializer.validated_data.get('phone_number', ''),
                'profile_image': None
            }
            
            # Create user in MongoDB
            created_user = auth_mongodb_service.create_user(user_data)
            
            if created_user:
                # Generate token
                token = auth_mongodb_service.create_token(created_user['id'])
                
                return Response({
                    'user': created_user,
                    'token': token,
                    'message': 'User registered successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'User already exists or registration failed'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            # Authenticate user with MongoDB
            user = auth_mongodb_service.authenticate_user(username, password)
            
            if user:
                if user.get('is_active', True):
                    # Generate token
                    token = auth_mongodb_service.create_token(user['id'])
                    
                    if token:
                        return Response({
                            'token': token,
                            'user': user,
                            'message': 'Login successful'
                        })
                    else:
                        return Response({'error': 'Failed to generate token'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    return Response({'error': 'Account is disabled'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Get token from request headers
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token = auth_header.split(' ')[1]
            # Delete the token from MongoDB
            auth_mongodb_service.delete_token(token)
        
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        # Get user ID from token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token = auth_header.split(' ')[1]
            user = auth_mongodb_service.validate_token(token)
            
            if not user:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if request.method == 'GET':
                return Response(user)
            
            elif request.method == 'PUT':
                # Update user information
                update_data = {}
                
                # Map request data to MongoDB fields
                if 'first_name' in request.data:
                    update_data['first_name'] = request.data['first_name']
                if 'last_name' in request.data:
                    update_data['last_name'] = request.data['last_name']
                if 'email' in request.data:
                    update_data['email'] = request.data['email']
                if 'phone_number' in request.data:
                    update_data['phone_number'] = request.data['phone_number']
                if 'organization' in request.data:
                    update_data['organization'] = request.data['organization']
                if 'role' in request.data:
                    update_data['role'] = request.data['role']
                
                # Update user in MongoDB
                updated_user = auth_mongodb_service.update_user(user['id'], update_data)
                
                if updated_user:
                    return Response(updated_user)
                else:
                    return Response({'error': 'Failed to update profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({'error': 'Invalid authorization header'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            # Get user from token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Token '):
                token = auth_header.split(' ')[1]
                user = auth_mongodb_service.validate_token(token)
                
                if not user:
                    return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
                
                # Change password in MongoDB
                success = auth_mongodb_service.change_password(
                    user['id'],
                    serializer.validated_data['old_password'],
                    serializer.validated_data['new_password']
                )
                
                if success:
                    return Response({'message': 'Password changed successfully'})
                else:
                    return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Invalid authorization header'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            # Here you would typically send a password reset email
            # For now, just return success
            return Response({'message': 'Password reset email sent'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrganizationListView(generics.ListCreateAPIView):
    queryset = Organization.objects.filter(is_active=True)
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    """Upload profile image for authenticated user"""
    try:
        if 'profile_image' not in request.FILES:
            return Response({
                'success': False,
                'error': 'No image file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['profile_image']
        
        # Validate file type
        if not image_file.content_type.startswith('image/'):
            return Response({
                'success': False,
                'error': 'File must be an image'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 5MB)
        if image_file.size > 5 * 1024 * 1024:
            return Response({
                'success': False,
                'error': 'Image size must be less than 5MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle MongoDB user (new system)
        if hasattr(request.user, '_user_data'):
            # This is a MongoDBUser
            from .mongodb_service import auth_mongodb_service
            from imagekit_service import imagekit_service
            import uuid
            
            # Generate unique filename
            file_extension = image_file.name.split('.')[-1] if '.' in image_file.name else 'jpg'
            unique_filename = f"{request.user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            # Upload to ImageKit
            upload_result = imagekit_service.upload_file(
                file=image_file,
                folder=f"nudrrs/profile_images/{request.user.id}",
                filename=unique_filename,
                tags=['nudrrs', 'profile_image', request.user.username]
            )
            
            if upload_result['success']:
                # Get ImageKit URL
                image_url = upload_result['url']
                file_id = upload_result['file_id']
                
                # Update user profile in MongoDB
                update_data = {
                    'profile_image': image_url,  # Store ImageKit URL
                    'profile_image_url': image_url,
                    'profile_image_file_id': file_id,  # Store ImageKit file ID
                    'updated_at': timezone.now().isoformat()
                }
                
                # Use the MongoDB ObjectId string, not the integer user_id
                user_id = request.user._user_data.get('id') if hasattr(request.user, '_user_data') else str(request.user.id)
                updated_user = auth_mongodb_service.update_user(user_id, update_data)
                
                if updated_user:
                    return Response({
                        'success': True,
                        'message': 'Profile image uploaded successfully to ImageKit',
                        'image_url': image_url,
                        'file_id': file_id
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'success': False,
                        'error': 'Failed to update user profile in database'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({
                    'success': False,
                    'error': f'ImageKit upload failed: {upload_result.get("error", "Unknown error")}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        else:
            # Handle Django User (legacy system)
            profile, created = UserProfile.objects.get_or_create(
                user=request.user,
                defaults={'role': 'VIEWER'}
            )
            
            # Save the image
            profile.profile_image = image_file
            profile.save()
            
            # Return success response with image URL
            image_url = None
            if profile.profile_image:
                image_url = request.build_absolute_uri(profile.profile_image.url)
            
            return Response({
                'success': True,
                'message': 'Profile image uploaded successfully',
                'image_url': image_url,
                'profile': UserProfileSerializer(profile, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to upload image: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
