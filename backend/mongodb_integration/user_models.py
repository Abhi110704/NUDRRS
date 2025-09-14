from mongoengine import Document, StringField, EmailField, BooleanField, DateTimeField, IntField
from datetime import datetime
import hashlib
import secrets

class MongoDBUser(Document):
    """
    MongoDB User model for storing user data
    """
    username = StringField(required=True, unique=True, max_length=150)
    email = EmailField(required=True, unique=True)
    first_name = StringField(max_length=150, default='')
    last_name = StringField(max_length=150, default='')
    password_hash = StringField(required=True)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    is_superuser = BooleanField(default=False)
    date_joined = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()
    
    # Additional fields for emergency reports
    phone_number = StringField(max_length=20, default='')
    emergency_contact = StringField(max_length=20, default='')
    address = StringField(max_length=255, default='')
    
    # Token for API authentication
    api_token = StringField(unique=True, sparse=True)
    
    meta = {
        'collection': 'users',
        'indexes': [
            'username',
            'email',
            'api_token'
        ]
    }
    
    def set_password(self, raw_password):
        """Set password hash"""
        # Using Django's password hashing approach
        import django.contrib.auth.hashers as hashers
        self.password_hash = hashers.make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check password"""
        import django.contrib.auth.hashers as hashers
        return hashers.check_password(raw_password, self.password_hash)
    
    def generate_api_token(self):
        """Generate API token for authentication"""
        self.api_token = secrets.token_urlsafe(32)
        return self.api_token
    
    def __str__(self):
        return self.username
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name or self.username
