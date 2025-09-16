from mongoengine import Document, StringField, DateTimeField, IntField, FloatField, ListField, DictField, ReferenceField
from datetime import datetime

class EmergencyReport(Document):
    """MongoDB model for emergency reports with enhanced data structure"""
    report_id = StringField(required=True, unique=True)
    user_id = IntField(required=True)
    username = StringField(required=True)
    emergency_type = StringField(required=True)
    disaster_type = StringField()  # Additional field for disaster type
    severity = StringField(required=True)
    priority = StringField()  # Additional field for priority
    location = DictField()  # {lat: float, lng: float, address: string}
    latitude = FloatField()  # Direct latitude field
    longitude = FloatField()  # Direct longitude field
    address = StringField()  # Direct address field
    description = StringField(required=True)
    phone_number = StringField()  # Phone number field
    images = ListField(StringField())  # List of image URLs
    media = ListField(DictField())  # Media objects
    status = StringField(default='pending')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    # AI Analysis data
    ai_analysis = DictField()
    ai_analysis_data = DictField()  # Additional AI analysis field
    fraud_score = FloatField(default=0.0)
    ai_fraud_score = FloatField(default=0.0)  # Additional fraud score field
    ai_confidence = FloatField(default=0.0)  # AI confidence score
    ai_verified = StringField(default='pending')  # AI verification status
    verified = StringField(default='pending')
    
    # Voting system
    vote_counts = DictField()  # Vote counts
    vote_percentages = DictField()  # Vote percentages
    user_vote = DictField()  # User votes
    
    # Updates/Comments
    updates = ListField(DictField())  # Comments and updates
    
    # Additional metadata
    metadata = DictField()
    source = StringField()  # Source of the report
    migrated_at = DateTimeField()  # Migration timestamp
    
    meta = {
        'collection': 'emergency_reports',
        'indexes': [
            'report_id',
            'user_id',
            'emergency_type',
            'status',
            'created_at',
            ('location.lat', 'location.lng')  # Geospatial index
        ]
    }

class AnalyticsData(Document):
    """MongoDB model for analytics and reporting data"""
    data_type = StringField(required=True)  # 'dashboard_stats', 'user_activity', etc.
    data = DictField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)
    user_id = IntField()
    
    meta = {
        'collection': 'analytics_data',
        'indexes': ['data_type', 'timestamp', 'user_id']
    }

class NotificationLog(Document):
    """MongoDB model for notification logs"""
    user_id = IntField(required=True)
    notification_type = StringField(required=True)
    message = StringField(required=True)
    sent_at = DateTimeField(default=datetime.utcnow)
    status = StringField(default='sent')  # sent, failed, pending
    metadata = DictField()
    
    meta = {
        'collection': 'notification_logs',
        'indexes': ['user_id', 'notification_type', 'sent_at']
    }

class SystemLog(Document):
    """MongoDB model for system logs"""
    level = StringField(required=True)  # INFO, WARNING, ERROR, DEBUG
    message = StringField(required=True)
    module = StringField()
    user_id = IntField()
    timestamp = DateTimeField(default=datetime.utcnow)
    metadata = DictField()
    
    meta = {
        'collection': 'system_logs',
        'indexes': ['level', 'timestamp', 'module', 'user_id']
    }