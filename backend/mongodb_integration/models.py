from mongoengine import Document, StringField, DateTimeField, IntField, FloatField, ListField, DictField, ReferenceField
from datetime import datetime

class EmergencyReport(Document):
    """MongoDB model for emergency reports with enhanced data structure"""
    report_id = StringField(required=True, unique=True)
    user_id = IntField(required=True)
    username = StringField(required=True)
    emergency_type = StringField(required=True)
    severity = StringField(required=True)
    location = DictField()  # {lat: float, lng: float, address: string}
    description = StringField(required=True)
    images = ListField(StringField())  # List of image URLs
    status = StringField(default='pending')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    # AI Analysis data
    ai_analysis = DictField()
    fraud_score = FloatField(default=0.0)
    verified = StringField(default='pending')
    
    # Additional metadata
    metadata = DictField()
    
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