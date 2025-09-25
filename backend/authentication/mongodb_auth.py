"""
Custom MongoDB Authentication Backend for Django REST Framework
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from authentication.services import auth_mongodb_service
import jwt
from django.conf import settings

class MongoDBTokenAuthentication(BaseAuthentication):
    """
    Custom authentication class that uses MongoDB for token validation
    """
    
    def authenticate(self, request):
        """
        Returns a two-tuple of `User` and `token` if authentication should
        succeed, or `None` if authentication should fail.
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header:
            return None

        try:
            scheme, token = auth_header.split(' ', 1)
        except ValueError:
            return None

        # Support opaque Token and JWT Bearer
        if scheme == 'Token':
            if not auth_mongodb_service:
                return None
            user_data = auth_mongodb_service.validate_token(token)
            if user_data:
                return (MongoDBUser(user_data), token)
            return None

        if scheme == 'Bearer':
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = str(payload.get('user_id'))
                if not user_id or not auth_mongodb_service:
                    return None
                # Load user from Mongo to get full profile
                user_data = auth_mongodb_service.get_user_by_id(user_id)
                if user_data:
                    return (MongoDBUser(user_data), token)
            except Exception:
                return None

        return None
    
    def authenticate_header(self, request):
        """
        Return a string to be used as the value of the `WWW-Authenticate`
        header in a `401 Unauthenticated` response.
        """
        return 'Token'

class MongoDBUser:
    """
    Simple user object that mimics Django's User model for REST Framework
    """
    
    def __init__(self, user_data):
        self.id = user_data.get('id')
        self.username = user_data.get('username', '')
        self.email = user_data.get('email', '')
        self.first_name = user_data.get('first_name', '')
        self.last_name = user_data.get('last_name', '')
        self.is_active = user_data.get('is_active', True)
        self.is_staff = user_data.get('is_staff', False)
        self.is_superuser = user_data.get('is_superuser', False)
        self.role = user_data.get('role', 'VIEWER')
        self.organization = user_data.get('organization', '')
        self.phone_number = user_data.get('phone_number', '')
        self.profile_image = user_data.get('profile_image')
        self.created_at = user_data.get('created_at')
        self.updated_at = user_data.get('updated_at')
        self.last_login = user_data.get('last_login')
        
        # Store the full user data for easy access
        self._user_data = user_data
    
    def __str__(self):
        return self.username
    
    def __repr__(self):
        return f"<MongoDBUser: {self.username}>"
    
    def has_perm(self, perm, obj=None):
        """Check if user has a specific permission"""
        if self.is_superuser:
            return True
        
        # Map common permissions to roles
        permission_map = {
            'sos_reports.add_sosreport': ['ADMIN', 'MANAGER', 'VIEWER'],
            'sos_reports.change_sosreport': ['ADMIN', 'MANAGER'],
            'sos_reports.delete_sosreport': ['ADMIN'],
            'sos_reports.view_sosreport': ['ADMIN', 'MANAGER', 'VIEWER'],
            'authentication.add_user': ['ADMIN'],
            'authentication.change_user': ['ADMIN', 'MANAGER'],
            'authentication.delete_user': ['ADMIN'],
            'authentication.view_user': ['ADMIN', 'MANAGER', 'VIEWER'],
        }
        
        allowed_roles = permission_map.get(perm, [])
        return self.role in allowed_roles
    
    def has_module_perms(self, app_label):
        """Check if user has permissions for a specific app"""
        if self.is_superuser:
            return True
        
        # Allow access to main apps for all authenticated users
        allowed_apps = ['sos_reports', 'authentication', 'notifications', 'analytics']
        return app_label in allowed_apps
    
    def get_full_name(self):
        """Return the user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return the user's short name"""
        return self.first_name or self.username
    
    @property
    def is_authenticated(self):
        """Always return True for authenticated users"""
        return True
    
    @property
    def is_anonymous(self):
        """Always return False for authenticated users"""
        return False
