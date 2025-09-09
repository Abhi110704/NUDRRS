from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, Organization

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'org_type', 'address', 'contact_person', 'contact_email', 'contact_phone']

class UserProfileSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'phone_number', 'profile_image', 'profile_image_url', 'organization', 'organization_id', 'is_active']
    
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    organization = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Pass context to nested profile serializer
        if 'context' in kwargs:
            self.fields['profile'] = UserProfileSerializer(context=kwargs['context'])
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password2', 'phone_number', 'organization', 'profile']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        # Extract profile data
        phone_number = validated_data.pop('phone_number', '')
        organization_name = validated_data.pop('organization', '')
        password2 = validated_data.pop('password2')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create or get organization
        organization = None
        if organization_name:
            organization, created = Organization.objects.get_or_create(
                name=organization_name,
                defaults={'org_type': 'OTHER'}
            )
        
        # Create user profile
        UserProfile.objects.create(
            user=user,
            role='VIEWER',  # Default role for new users
            phone_number=phone_number,
            organization=organization
        )
        
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password2 = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
