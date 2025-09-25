"""
MongoDB service for Authentication
Handles all user authentication operations using MongoDB
"""

import logging
import time
from pymongo import MongoClient
import ssl
from django.conf import settings
from datetime import datetime, timedelta
import hashlib
import secrets
from typing import Dict, Optional, List

# Set up logging
logger = logging.getLogger(__name__)

class AuthMongoDBService:
    """Service class for Authentication operations with MongoDB"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self._is_connected = False
        self.connect()
        
    def __del__(self):
        """Ensure connections are closed when the object is garbage collected"""
        self.close()
    
    def connect(self, max_retries=3, initial_delay=1):
        """Connect to MongoDB Atlas with retry logic
        
        Args:
            max_retries (int): Maximum number of connection attempts
            initial_delay (int): Initial delay between retries in seconds
            
        Raises:
            ConnectionError: If connection fails after all retries
        """
        retry_count = 0
        delay = initial_delay
        
        while retry_count < max_retries:
            try:
                logger.info(f"Attempting to connect to MongoDB (Attempt {retry_count + 1}/{max_retries})")
                
                # Get connection string from environment variables
                connection_string = settings.MONGODB_SETTINGS['host']
                database_name = settings.MONGODB_SETTINGS['db']
                
                # Set a reasonable server selection timeout
                self.client = MongoClient(
                    connection_string,
                    serverSelectionTimeoutMS=5000,  # 5 second timeout
                    connectTimeoutMS=10000,         # 10 second connection timeout
                    socketTimeoutMS=30000            # 30 second socket timeout
                )
                
                self.db = self.client[database_name]
                
                # Test connection with a ping
                self.client.admin.command('ping')
                self._is_connected = True
                logger.info("✅ Successfully connected to MongoDB Atlas")
                return  # Success, exit the retry loop
                
            except Exception as e:
                retry_count += 1
                logger.warning(f"Connection attempt {retry_count} failed: {str(e)}")
                
                if retry_count >= max_retries:
                    logger.error("❌ Failed to connect to MongoDB after maximum retries")
                    raise ConnectionError(f"Failed to connect to MongoDB after {max_retries} attempts: {str(e)}")
                
                # Exponential backoff
                time.sleep(delay)
                delay = min(delay * 2, 30)  # Cap the delay at 30 seconds
                
    def close(self):
        """Close the MongoDB connection"""
        if self.client and self._is_connected:
            try:
                self.client.close()
                logger.info("Closed MongoDB connection")
            except Exception as e:
                logger.error(f"Error closing MongoDB connection: {e}")
            finally:
                self.client = None
                self.db = None
                self._is_connected = False
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _serialize_user_data(self, user_data: Dict) -> Dict:
        """Convert ObjectIds to strings for JSON serialization"""
        from bson import ObjectId
        
        serialized_data = {}
        for key, value in user_data.items():
            if isinstance(value, ObjectId):
                serialized_data[key] = str(value)
            elif isinstance(value, dict):
                serialized_data[key] = self._serialize_user_data(value)
            elif isinstance(value, list):
                serialized_data[key] = [
                    str(item) if isinstance(item, ObjectId) else item
                    for item in value
                ]
            else:
                serialized_data[key] = value
        
        return serialized_data
    
    def create_user(self, user_data: Dict) -> Optional[Dict]:
        """Create a new user in MongoDB"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['users']
            
            # Check if user already exists
            existing_user = collection.find_one({
                '$or': [
                    {'username': user_data['username']},
                    {'email': user_data['email']}
                ]
            })
            
            if existing_user:
                return None  # User already exists
            
            # Hash password
            user_data['password'] = self.hash_password(user_data['password'])
            
            # Add timestamps
            now = datetime.utcnow()
            user_data['created_at'] = now
            user_data['updated_at'] = now
            user_data['last_login'] = None
            user_data['is_active'] = True
            user_data['is_staff'] = False
            user_data['is_superuser'] = False
            
            # Insert the user
            result = collection.insert_one(user_data)
            
            if result.inserted_id:
                # Return the created user (without password)
                user_data['id'] = str(result.inserted_id)
                user_data['created_at'] = now.isoformat()
                user_data['updated_at'] = now.isoformat()
                del user_data['password']  # Remove password from response
                
                # Ensure all ObjectIds are converted to strings for JSON serialization
                return self._serialize_user_data(user_data)
            
            return None
        except Exception as e:
            print(f"Error creating user in MongoDB: {e}")
            return None
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict]:
        """Authenticate user with username/email and password"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['users']
            
            # Find user by username or email
            user = collection.find_one({
                '$or': [
                    {'username': username},
                    {'email': username}
                ],
                'is_active': True
            })
            
            if user and 'password' in user and user['password'] == self.hash_password(password):
                # Update last login
                collection.update_one(
                    {'_id': user['_id']},
                    {'$set': {'last_login': datetime.utcnow()}}
                )
                
                # Return user without password
                user['id'] = str(user['_id'])
                del user['_id']
                if 'password' in user:
                    del user['password']
                
                # Format dates
                if 'created_at' in user and isinstance(user['created_at'], datetime):
                    user['created_at'] = user['created_at'].isoformat()
                if 'updated_at' in user and isinstance(user['updated_at'], datetime):
                    user['updated_at'] = user['updated_at'].isoformat()
                if 'last_login' in user and isinstance(user['last_login'], datetime):
                    user['last_login'] = user['last_login'].isoformat()
                
                # Ensure all ObjectIds are converted to strings for JSON serialization
                return self._serialize_user_data(user)
            
            return None
        except Exception as e:
            print(f"Error authenticating user in MongoDB: {e}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['users']
            
            # Try to find user by ObjectId first, then by string ID
            from bson import ObjectId
            try:
                user = collection.find_one({'_id': ObjectId(user_id)})
            except:
                user = collection.find_one({'_id': user_id})
            
            if user:
                user['id'] = str(user['_id'])
                del user['_id']
                if 'password' in user:
                    del user['password']  # Remove password
                
                # Format dates
                if 'created_at' in user and isinstance(user['created_at'], datetime):
                    user['created_at'] = user['created_at'].isoformat()
                if 'updated_at' in user and isinstance(user['updated_at'], datetime):
                    user['updated_at'] = user['updated_at'].isoformat()
                if 'last_login' in user and isinstance(user['last_login'], datetime):
                    user['last_login'] = user['last_login'].isoformat()
                
                # Ensure all ObjectIds are converted to strings for JSON serialization
                return self._serialize_user_data(user)
            
            return None
        except Exception as e:
            print(f"Error getting user by ID from MongoDB: {e}")
            return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['users']
            user = collection.find_one({'username': username})
            
            if user:
                user['id'] = str(user['_id'])
                del user['_id']
                del user['password']  # Remove password
                
                # Format dates
                if 'created_at' in user and isinstance(user['created_at'], datetime):
                    user['created_at'] = user['created_at'].isoformat()
                if 'updated_at' in user and isinstance(user['updated_at'], datetime):
                    user['updated_at'] = user['updated_at'].isoformat()
                if 'last_login' in user and isinstance(user['last_login'], datetime):
                    user['last_login'] = user['last_login'].isoformat()
                
                return user
            
            return None
        except Exception as e:
            print(f"Error getting user by username from MongoDB: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email address"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['users']
            user = collection.find_one({'email': email})
            
            if user:
                user['id'] = str(user['_id'])
                del user['_id']
                del user['password']  # Remove password
                
                # Format dates
                if 'created_at' in user and isinstance(user['created_at'], datetime):
                    user['created_at'] = user['created_at'].isoformat()
                if 'updated_at' in user and isinstance(user['updated_at'], datetime):
                    user['updated_at'] = user['updated_at'].isoformat()
                if 'last_login' in user and isinstance(user['last_login'], datetime):
                    user['last_login'] = user['last_login'].isoformat()
                
                return user
            
            return None
        except Exception as e:
            print(f"Error getting user by email from MongoDB: {e}")
            return None
    
    def update_user(self, user_id: str, update_data: Dict) -> Optional[Dict]:
        """Update user information"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['users']
            
            # Remove password from update data if present
            if 'password' in update_data:
                del update_data['password']
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            # Convert string user_id to ObjectId
            from bson import ObjectId
            object_id = ObjectId(user_id)
            
            # Update the user
            result = collection.update_one(
                {'_id': object_id},
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                # Return the updated user
                return self.get_user_by_id(user_id)
            
            return None
        except Exception as e:
            print(f"Error updating user in MongoDB: {e}")
            return None
    
    def update_user_profile(self, user_id: str, update_data: dict) -> bool:
        """Update user profile information"""
        try:
            if self.db is None:
                return False
            
            collection = self.db['users']
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            # Update the user profile
            result = collection.update_one(
                {'_id': user_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating user profile in MongoDB: {e}")
            return False

    def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """Change user password"""
        try:
            if self.db is None:
                return False
            
            collection = self.db['users']
            
            # Find user and verify old password
            user = collection.find_one({'_id': user_id})
            if not user or user['password'] != self.hash_password(old_password):
                return False
            
            # Update password
            result = collection.update_one(
                {'_id': user_id},
                {'$set': {
                    'password': self.hash_password(new_password),
                    'updated_at': datetime.utcnow()
                }}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error changing password in MongoDB: {e}")
            return False
    
    def create_token(self, user_id: str) -> str:
        """Create authentication token for user"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['auth_tokens']
            
            # Generate token
            token = secrets.token_urlsafe(32)
            
            # Store token
            token_data = {
                'user_id': user_id,
                'token': token,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow().replace(year=datetime.utcnow().year + 1)  # 1 year expiry
            }
            
            result = collection.insert_one(token_data)
            
            if result.inserted_id:
                return token
            
            return None
        except Exception as e:
            print(f"Error creating token in MongoDB: {e}")
            return None
    
    def validate_token(self, token: str) -> Optional[Dict]:
        """Validate authentication token"""
        try:
            if self.db is None:
                return None
            
            collection = self.db['auth_tokens']
            
            # Find token
            token_doc = collection.find_one({
                'token': token,
                'expires_at': {'$gt': datetime.utcnow()}
            })
            
            if token_doc:
                # Get user by ID (convert to string if needed)
                user_id = str(token_doc['user_id'])
                user = self.get_user_by_id(user_id)
                return user
            
            return None
        except Exception as e:
            print(f"Error validating token in MongoDB: {e}")
            return None
    
    def delete_token(self, token: str) -> bool:
        """Delete authentication token"""
        try:
            if self.db is None:
                return False
            
            collection = self.db['auth_tokens']
            result = collection.delete_one({'token': token})
            
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting token in MongoDB: {e}")
            return False
    
    def get_all_users(self, limit: int = 100, skip: int = 0) -> List[Dict]:
        """Get all users"""
        try:
            if self.db is None:
                return []
            
            collection = self.db['users']
            cursor = collection.find({}).sort('created_at', -1).skip(skip).limit(limit)
            users = list(cursor)
            
            # Convert ObjectId to string and remove passwords
            for user in users:
                user['id'] = str(user['_id'])
                del user['_id']
                if 'password' in user:
                    del user['password']
                
                # Format dates
                if 'created_at' in user and isinstance(user['created_at'], datetime):
                    user['created_at'] = user['created_at'].isoformat()
                if 'updated_at' in user and isinstance(user['updated_at'], datetime):
                    user['updated_at'] = user['updated_at'].isoformat()
                if 'last_login' in user and isinstance(user['last_login'], datetime):
                    user['last_login'] = user['last_login'].isoformat()
            
            return users
        except Exception as e:
            print(f"Error getting all users from MongoDB: {e}")
            return []
    
    def create_password_reset_token(self, email: str) -> Optional[Dict]:
        """Create password reset token for email"""
        try:
            if not self.db:
                return None
            
            # Check if user exists
            user = self.get_user_by_email(email)
            if not user:
                return None
            
            # Generate OTP
            from .email_service import EmailService
            otp = EmailService.generate_otp()
            
            # Create reset token document
            reset_data = {
                'email': email,
                'otp': otp,
                'user_id': user['id'],
                'created_at': datetime.now(),
                'expires_at': datetime.now() + timedelta(seconds=900),  # 15 minutes
                'is_used': False,
                'attempts': 0
            }
            
            collection = self.db['password_reset_tokens']
            result = collection.insert_one(reset_data)
            
            if result.inserted_id:
                # Send OTP email
                email_sent = EmailService.send_otp_email(
                    email=email,
                    otp=otp,
                    user_name=f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                )
                
                if email_sent:
                    return {
                        'id': str(result.inserted_id),
                        'email': email,
                        'expires_at': reset_data['expires_at'].isoformat(),
                        'message': 'OTP sent successfully'
                    }
                else:
                    # If email failed, delete the token
                    collection.delete_one({'_id': result.inserted_id})
                    return None
            
            return None
        except Exception as e:
            print(f"Error creating password reset token: {e}")
            return None
    
    def verify_password_reset_otp(self, email: str, otp: str) -> Optional[Dict]:
        """Verify password reset OTP"""
        try:
            if not self.db:
                return None
            
            collection = self.db['password_reset_tokens']
            
            # Find valid token
            token_doc = collection.find_one({
                'email': email,
                'otp': otp,
                'is_used': False,
                'expires_at': {'$gt': datetime.now()}
            })
            
            if not token_doc:
                # Increment attempts for failed verification
                collection.update_one(
                    {'email': email, 'is_used': False},
                    {'$inc': {'attempts': 1}}
                )
                return None
            
            # Mark token as verified but not used yet
            collection.update_one(
                {'_id': token_doc['_id']},
                {'$set': {'verified_at': datetime.now()}}
            )
            
            return {
                'id': str(token_doc['_id']),
                'user_id': token_doc['user_id'],
                'email': email,
                'verified_at': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error verifying password reset OTP: {e}")
            return None
    
    def reset_password_with_token(self, email: str, new_password: str) -> bool:
        """Reset password using verified token"""
        try:
            if not self.db:
                return False
            
            # Find verified token (either used or recently verified)
            collection = self.db['password_reset_tokens']
            token_doc = collection.find_one({
                'email': email,
                '$or': [
                    {'is_used': True, 'verified_at': {'$exists': True}},
                    {'is_used': False, 'verified_at': {'$exists': True}}
                ]
            })
            
            if not token_doc:
                return False
            
            # Update user password
            user_id = token_doc['user_id']
            hashed_password = self.hash_password(new_password)
            
            from bson import ObjectId
            users_collection = self.db['users']
            result = users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {
                    '$set': {
                        'password': hashed_password,
                        'updated_at': datetime.now()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Mark token as used and completed
                collection.update_one(
                    {'_id': token_doc['_id']},
                    {'$set': {'is_used': True, 'completed_at': datetime.now()}}
                )
                
                # Send success email
                from .email_service import EmailService
                user = self.get_user_by_id(user_id)
                if user:
                    EmailService.send_password_reset_success_email(
                        email=email,
                        user_name=f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                    )
                
                return True
            
            return False
        except Exception as e:
            print(f"Error resetting password: {e}")
            return False
    
    def cleanup_expired_tokens(self):
        """Clean up expired password reset tokens"""
        try:
            if not self.db:
                return
            
            collection = self.db['password_reset_tokens']
            result = collection.delete_many({
                'expires_at': {'$lt': datetime.now()}
            })
            
            if result.deleted_count > 0:
                print(f"Cleaned up {result.deleted_count} expired password reset tokens")
        except Exception as e:
            print(f"Error cleaning up expired tokens: {e}")

    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

# Global instance
auth_mongodb_service = AuthMongoDBService()
