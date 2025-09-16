"""
MongoDB service for Authentication
Handles all user authentication operations using MongoDB
"""
from pymongo import MongoClient
import ssl
from django.conf import settings
from datetime import datetime
import hashlib
import secrets
from typing import Dict, Optional, List

class AuthMongoDBService:
    """Service class for Authentication operations with MongoDB"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            # Get connection string from environment variables
            connection_string = settings.MONGODB_SETTINGS['host']
            database_name = settings.MONGODB_SETTINGS['db']
            
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=10000, ssl_cert_reqs=ssl.CERT_NONE)
            self.db = self.client[database_name]
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ Connected to MongoDB Atlas for Authentication")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.client = None
            self.db = None
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, user_data: Dict) -> Optional[Dict]:
        """Create a new user in MongoDB"""
        try:
            if not self.db:
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
                return user_data
            
            return None
        except Exception as e:
            print(f"Error creating user in MongoDB: {e}")
            return None
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict]:
        """Authenticate user with username/email and password"""
        try:
            if not self.db:
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
                
                return user
            
            return None
        except Exception as e:
            print(f"Error authenticating user in MongoDB: {e}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        try:
            if not self.db:
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
                
                return user
            
            return None
        except Exception as e:
            print(f"Error getting user by ID from MongoDB: {e}")
            return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username"""
        try:
            if not self.db:
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
    
    def update_user(self, user_id: str, update_data: Dict) -> Optional[Dict]:
        """Update user information"""
        try:
            if not self.db:
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
            if not self.db:
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
            if not self.db:
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
            if not self.db:
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
            if not self.db:
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
            if not self.db:
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
            if not self.db:
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
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

# Global instance
auth_mongodb_service = AuthMongoDBService()
