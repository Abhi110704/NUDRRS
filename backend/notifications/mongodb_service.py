"""
MongoDB service for Notifications
Handles all notification operations using MongoDB
"""
from pymongo import MongoClient
from django.conf import settings
from datetime import datetime
from typing import List, Dict, Optional

class NotificationMongoDBService:
    """Service class for Notification operations with MongoDB"""
    
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
            
            # PyMongo 4+: rely on URI TLS options; do not pass legacy ssl_cert_reqs
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
            self.db = self.client[database_name]
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ Connected to MongoDB Atlas for Notifications")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.client = None
            self.db = None
    
    def create_notification(self, notification_data: Dict) -> Optional[Dict]:
        """Create a new notification in MongoDB"""
        try:
            if not self.db:
                return None
            
            collection = self.db['notifications']
            
            # Add timestamps
            now = datetime.utcnow()
            notification_data['created_at'] = now
            notification_data['sent_at'] = None
            notification_data['status'] = 'pending'
            
            # Insert the notification
            result = collection.insert_one(notification_data)
            
            if result.inserted_id:
                # Return the created notification
                notification_data['id'] = str(result.inserted_id)
                notification_data['created_at'] = now.isoformat()
                return notification_data
            
            return None
        except Exception as e:
            print(f"Error creating notification in MongoDB: {e}")
            return None
    
    def get_notifications(self, limit: int = 50, skip: int = 0, user_id: Optional[str] = None) -> List[Dict]:
        """Get notifications from MongoDB"""
        try:
            if not self.db:
                return []
            
            collection = self.db['notifications']
            query = {}
            
            # Filter by user if specified
            if user_id:
                query['recipient'] = user_id
            
            # Execute query
            cursor = collection.find(query).sort('created_at', -1).skip(skip).limit(limit)
            notifications = list(cursor)
            
            # Convert ObjectId to string and format dates
            for notification in notifications:
                if '_id' in notification:
                    notification['id'] = str(notification['_id'])
                    del notification['_id']
                
                # Ensure dates are properly formatted
                if 'created_at' in notification and isinstance(notification['created_at'], datetime):
                    notification['created_at'] = notification['created_at'].isoformat()
                
                if 'sent_at' in notification and isinstance(notification['sent_at'], datetime):
                    notification['sent_at'] = notification['sent_at'].isoformat()
                elif 'sent_at' in notification and notification['sent_at'] is None:
                    notification['sent_at'] = None
            
            return notifications
        except Exception as e:
            print(f"Error getting notifications from MongoDB: {e}")
            return []
    
    def update_notification_status(self, notification_id: str, status: str) -> bool:
        """Update notification status"""
        try:
            if not self.db:
                return False
            
            collection = self.db['notifications']
            
            update_data = {'status': status}
            if status == 'sent':
                update_data['sent_at'] = datetime.utcnow()
            
            result = collection.update_one(
                {'_id': notification_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating notification status in MongoDB: {e}")
            return False
    
    def get_notification_by_id(self, notification_id: str) -> Optional[Dict]:
        """Get a single notification by ID"""
        try:
            if not self.db:
                return None
            
            collection = self.db['notifications']
            notification = collection.find_one({'_id': notification_id})
            
            if notification:
                if '_id' in notification:
                    notification['id'] = str(notification['_id'])
                    del notification['_id']
                
                # Format dates
                if 'created_at' in notification and isinstance(notification['created_at'], datetime):
                    notification['created_at'] = notification['created_at'].isoformat()
                
                if 'sent_at' in notification and isinstance(notification['sent_at'], datetime):
                    notification['sent_at'] = notification['sent_at'].isoformat()
                elif 'sent_at' in notification and notification['sent_at'] is None:
                    notification['sent_at'] = None
            
            return notification
        except Exception as e:
            print(f"Error getting notification by ID from MongoDB: {e}")
            return None
    
    def delete_notification(self, notification_id: str) -> bool:
        """Delete a notification from MongoDB"""
        try:
            if not self.db:
                return False
            
            collection = self.db['notifications']
            result = collection.delete_one({'_id': notification_id})
            
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting notification from MongoDB: {e}")
            return False
    
    def get_notifications_by_recipient(self, recipient: str, limit: int = 50) -> List[Dict]:
        """Get notifications for a specific recipient"""
        try:
            if not self.db:
                return []
            
            collection = self.db['notifications']
            cursor = collection.find({'recipient': recipient}).sort('created_at', -1).limit(limit)
            notifications = list(cursor)
            
            # Convert ObjectId to string and format dates
            for notification in notifications:
                if '_id' in notification:
                    notification['id'] = str(notification['_id'])
                    del notification['_id']
                
                # Format dates
                if 'created_at' in notification and isinstance(notification['created_at'], datetime):
                    notification['created_at'] = notification['created_at'].isoformat()
                
                if 'sent_at' in notification and isinstance(notification['sent_at'], datetime):
                    notification['sent_at'] = notification['sent_at'].isoformat()
                elif 'sent_at' in notification and notification['sent_at'] is None:
                    notification['sent_at'] = None
            
            return notifications
        except Exception as e:
            print(f"Error getting notifications by recipient from MongoDB: {e}")
            return []
    
    def broadcast_notification(self, message: str, notification_type: str = 'BROADCAST', priority: str = 'MEDIUM') -> Optional[Dict]:
        """Create a broadcast notification"""
        try:
            if not self.db:
                return None
            
            # Create broadcast notification
            broadcast_data = {
                'recipient': 'ALL_USERS',
                'message': message,
                'type': notification_type,
                'priority': priority,
                'is_broadcast': True,
                'created_by': 'SYSTEM'
            }
            
            return self.create_notification(broadcast_data)
        except Exception as e:
            print(f"Error creating broadcast notification in MongoDB: {e}")
            return None
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

# Global instance
notification_mongodb_service = NotificationMongoDBService()
