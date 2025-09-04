from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from .models import UserProfile, Organization
from .serializers import (
    UserSerializer, LoginSerializer, UserProfileSerializer, 
    ChangePasswordSerializer, PasswordResetSerializer, OrganizationSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user
        user = serializer.save()
        
        # Create user profile
        profile_data = request.data.get('profile', {})
        UserProfile.objects.create(
            user=user,
            role=profile_data.get('role', 'VIEWER'),
            phone_number=profile_data.get('phone_number', ''),
            organization_id=profile_data.get('organization_id')
        )
        
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
                    # Profile doesn't exist, continue without it
                    pass
                
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
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        user_serializer = UserSerializer(request.user, data=request.data, partial=True)
        profile_serializer = UserProfileSerializer(request.user.profile, data=request.data.get('profile', {}), partial=True)
        
        if user_serializer.is_valid() and profile_serializer.is_valid():
            user_serializer.save()
            profile_serializer.save()
            return Response(UserSerializer(request.user).data)
        
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
