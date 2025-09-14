from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.conf import settings
from .models import UserProfile, Organization
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer, UserProfileSerializer, 
    ChangePasswordSerializer, PasswordResetSerializer, OrganizationSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user (this also creates the UserProfile via UserSerializer)
        user = serializer.save()
        
        # Generate token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        
        if user:
            if user.is_active:
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                
                # Update user profile (optional)
                try:
                    profile = user.profile
                    profile.last_login_ip = request.META.get('REMOTE_ADDR')
                    profile.save()
                except (UserProfile.DoesNotExist, AttributeError):
                    # Create a default profile if it doesn't exist
                    UserProfile.objects.create(
                        user=user,
                        role='VIEWER',
                        last_login_ip=request.META.get('REMOTE_ADDR')
                    )
                
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'message': 'Login successful'
                })
            else:
                return Response({'error': 'Account is disabled'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Delete the token
        request.user.auth_token.delete()
    except:
        pass
    
    logout(request)
    return Response({'message': 'Logout successful'})

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        # Ensure user has a profile
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            # Create a default profile if it doesn't exist
            profile = UserProfile.objects.create(
                user=request.user,
                role='VIEWER'
            )
        
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Ensure user has a profile
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            # Create a default profile if it doesn't exist
            profile = UserProfile.objects.create(
                user=request.user,
                role='VIEWER'
            )
        
        user_serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        profile_serializer = UserProfileSerializer(profile, data=request.data.get('profile', {}), partial=True, context={'request': request})
        
        if user_serializer.is_valid() and profile_serializer.is_valid():
            user_serializer.save()
            profile_serializer.save()
            return Response(UserSerializer(request.user, context={'request': request}).data)
        
        errors = {}
        if user_serializer.errors:
            errors.update(user_serializer.errors)
        if profile_serializer.errors:
            errors['profile'] = profile_serializer.errors
        
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if user.check_password(serializer.validated_data['old_password']):
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        else:
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        
        # Get or create user profile
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
