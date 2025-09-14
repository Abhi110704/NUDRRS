from .user_models import MongoDBUser
from .services import MongoDBService
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from datetime import datetime
import secrets

class MongoDBUserService:
    """
    Service class for handling MongoDB user operations
    """
    
    def __init__(self):
        self.mongodb_service = MongoDBService()
    
    def create_user(self, username, email, password, **extra_fields):
        """Create a new user in MongoDB"""
        try:
            # Check if user already exists
            if self.get_user_by_username(username):
                raise ValueError("User with this username already exists")
            
            if self.get_user_by_email(email):
                raise ValueError("User with this email already exists")
            
            # Create new user
            user = MongoDBUser(
                username=username,
                email=email,
                first_name=extra_fields.get('first_name', ''),
                last_name=extra_fields.get('last_name', ''),
                phone_number=extra_fields.get('phone_number', ''),
                emergency_contact=extra_fields.get('emergency_contact', ''),
                address=extra_fields.get('address', ''),
                is_active=extra_fields.get('is_active', True),
                is_staff=extra_fields.get('is_staff', False),
                is_superuser=extra_fields.get('is_superuser', False),
                date_joined=timezone.now()
            )
            
            # Set password
            user.set_password(password)
            
            # Generate API token
            user.generate_api_token()
            
            # Save to MongoDB
            user.save()
            
            return user
            
        except Exception as e:
            raise Exception(f"Error creating user: {str(e)}")
    
    def get_user_by_username(self, username):
        """Get user by username"""
        try:
            return MongoDBUser.objects(username=username).first()
        except Exception as e:
            print(f"Error getting user by username: {str(e)}")
            return None
    
    def get_user_by_email(self, email):
        """Get user by email"""
        try:
            return MongoDBUser.objects(email=email).first()
        except Exception as e:
            print(f"Error getting user by email: {str(e)}")
            return None
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        try:
            return MongoDBUser.objects(id=user_id).first()
        except Exception as e:
            print(f"Error getting user by ID: {str(e)}")
            return None
    
    def get_user_by_token(self, token):
        """Get user by API token"""
        try:
            return MongoDBUser.objects(api_token=token).first()
        except Exception as e:
            print(f"Error getting user by token: {str(e)}")
            return None
    
    def authenticate_user(self, username, password):
        """Authenticate user with username and password"""
        try:
            user = self.get_user_by_username(username)
            if user and user.check_password(password) and user.is_active:
                # Update last login
                user.last_login = timezone.now()
                user.save()
                return user
            return None
        except Exception as e:
            print(f"Error authenticating user: {str(e)}")
            return None
    
    def update_user(self, user_id, **update_data):
        """Update user data"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return None
            
            # Update fields
            for field, value in update_data.items():
                if hasattr(user, field) and field != 'id':
                    setattr(user, field, value)
            
            user.save()
            return user
            
        except Exception as e:
            raise Exception(f"Error updating user: {str(e)}")
    
    def delete_user(self, user_id):
        """Delete user"""
        try:
            user = self.get_user_by_id(user_id)
            if user:
                user.delete()
                return True
            return False
        except Exception as e:
            raise Exception(f"Error deleting user: {str(e)}")
    
    def list_users(self, is_active=None, is_staff=None):
        """List users with optional filters"""
        try:
            query = {}
            if is_active is not None:
                query['is_active'] = is_active
            if is_staff is not None:
                query['is_staff'] = is_staff
            
            return list(MongoDBUser.objects(**query))
        except Exception as e:
            print(f"Error listing users: {str(e)}")
            return []
    
    def change_password(self, user_id, old_password, new_password):
        """Change user password"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            if not user.check_password(old_password):
                return False
            
            user.set_password(new_password)
            user.save()
            return True
            
        except Exception as e:
            raise Exception(f"Error changing password: {str(e)}")
    
    def reset_api_token(self, user_id):
        """Reset user's API token"""
        try:
            user = self.get_user_by_id(user_id)
            if user:
                user.generate_api_token()
                user.save()
                return user.api_token
            return None
        except Exception as e:
            raise Exception(f"Error resetting API token: {str(e)}")
    
    def get_user_stats(self):
        """Get user statistics"""
        try:
            total_users = MongoDBUser.objects.count()
            active_users = MongoDBUser.objects(is_active=True).count()
            staff_users = MongoDBUser.objects(is_staff=True).count()
            
            return {
                'total_users': total_users,
                'active_users': active_users,
                'staff_users': staff_users,
                'inactive_users': total_users - active_users
            }
        except Exception as e:
            print(f"Error getting user stats: {str(e)}")
            return {
                'total_users': 0,
                'active_users': 0,
                'staff_users': 0,
                'inactive_users': 0
            }
