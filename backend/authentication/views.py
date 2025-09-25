from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .mongodb_service import AuthMongoDBService
from .serializers import (
    UserRegistrationSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    OrganizationSerializer
)
from .utils import get_tokens_for_user, send_password_reset_email
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

# Initialize MongoDB service
mongo_service = AuthMongoDBService()

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            try:
                # Check if user already exists
                if mongo_service.get_user_by_email(user_data['email']):
                    return Response(
                        {'error': 'User with this email already exists.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create user in MongoDB
                user_id = mongo_service.create_user(user_data)
                
                # Generate tokens
                tokens = get_tokens_for_user(str(user_id), user_data['email'])
                
                return Response({
                    'message': 'User registered successfully',
                    'user_id': str(user_id),
                    'tokens': tokens
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    try:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            # Authenticate user - we'll use username as email for authentication
            user = mongo_service.authenticate_user(username, password)
            if user:
                # Generate token and respond in shape expected by frontend
                user_id = user.get('id') or str(user.get('_id'))
                tokens = get_tokens_for_user(user_id, username)
                token_value = tokens.get('access') or tokens.get('token')

                # Minimal safe user payload for client
                user_payload = {
                    'id': user_id,
                    'username': user.get('username') or username,
                    'email': user.get('email', ''),
                    'first_name': user.get('first_name', ''),
                    'last_name': user.get('last_name', ''),
                    'role': user.get('role', 'VIEWER'),
                }

                return Response({
                    'message': 'Login successful',
                    'token': token_value,
                    'user': user_payload,
                })

            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.exception("Login failed due to unexpected error")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add token to blacklist
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        user_id = request.user.user_id
        user = mongo_service.get_user_by_id(user_id)
        if not user:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user_id = request.user.user_id
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        try:
            if mongo_service.change_password(user_id, old_password, new_password):
                return Response({'message': 'Password changed successfully'})
            return Response(
                {'error': 'Invalid old password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(
        data=request.data,
        context={'request': request}
    )
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = mongo_service.get_user_by_email(email)
            if user:
                # Generate and save OTP
                otp = mongo_service.generate_otp(str(user['_id']))
                
                # Send OTP via email
                send_password_reset_email(email, otp)
                
                return Response({
                    'message': 'OTP sent to your email',
                    'user_id': str(user['_id']),
                    'email': email  # Return email for frontend reference
                }, status=status.HTTP_200_OK)
            
            # Even if user doesn't exist, return success to prevent email enumeration
            return Response({
                'message': 'If your email is registered, you will receive an OTP',
                'email': email
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': 'Failed to process password reset request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def password_reset_verify_otp(request):
    serializer = PasswordResetVerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        try:
            user = mongo_service.get_user_by_email(email)
            if not user:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            user_id = str(user['_id'])
            if mongo_service.verify_otp(user_id, otp):
                # Generate a one-time token for password reset (valid for 10 minutes)
                reset_token = str(uuid.uuid4())
                mongo_service.store_reset_token(user_id, reset_token)
                
                return Response({
                    'message': 'OTP verified successfully',
                    'reset_token': reset_token,
                    'email': email
                }, status=status.HTTP_200_OK)
                
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {'error': 'Failed to verify OTP'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = mongo_service.get_user_by_email(email)
            if not user:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            user_id = str(user['_id'])
            
            # Verify OTP first
            if not mongo_service.verify_otp(user_id, otp):
                return Response(
                    {'error': 'Invalid or expired OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reset password
            if mongo_service.reset_password(user_id, new_password):
                # Invalidate the used OTP
                mongo_service.invalidate_otp(user_id, otp)
                return Response({
                    'message': 'Password reset successfully',
                    'email': email
                }, status=status.HTTP_200_OK)
                
            return Response(
                {'error': 'Failed to reset password'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {'error': 'Failed to reset password'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrganizationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            organizations = mongo_service.get_all_organizations()
            serializer = OrganizationSerializer(organizations, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OrganizationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, org_id):
        try:
            organization = mongo_service.get_organization_by_id(org_id)
            if not organization:
                return Response(
                    {'error': 'Organization not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    if 'image' not in request.FILES:
        return Response(
            {'error': 'No image file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        image_file = request.FILES['image']
        user_id = str(request.user.user_id)
        
        # Generate a unique filename
        file_ext = os.path.splitext(image_file.name)[1]
        filename = f"profile_images/{user_id}_{int(datetime.now().timestamp())}{file_ext}"
        
        # Save the file
        file_path = default_storage.save(filename, ContentFile(image_file.read()))
        file_url = default_storage.url(file_path)
        
        # Update user's profile image URL in database
        mongo_service.update_user_profile_image(user_id, file_url)
        
        return Response({
            'message': 'Profile image uploaded successfully',
            'image_url': file_url
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
