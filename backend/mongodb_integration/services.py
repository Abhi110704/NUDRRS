from mongoengine import connect, disconnect
from django.conf import settings
from .models import EmergencyReport, AnalyticsData, NotificationLog, SystemLog
import logging

logger = logging.getLogger(__name__)

class MongoDBService:
    """Service class for MongoDB operations"""
    
    def __init__(self):
        self.connected = False
        self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            if not self.connected:
                # Handle both local and Atlas connections
                host = settings.MONGODB_SETTINGS['host']
                db_name = settings.MONGODB_SETTINGS['db']
                
                # Check if it's an Atlas connection string
                if 'mongodb+srv://' in host or 'mongodb://' in host:
                    # For Atlas or connection string format
                    connect(
                        db=db_name,
                        host=host
                    )
                else:
                    # For local MongoDB
                    port = settings.MONGODB_SETTINGS.get('port', 27017)
                    connect(
                        db=db_name,
                        host=host,
                        port=port
                    )
                
                self.connected = True
                logger.info(f"Connected to MongoDB successfully: {host}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.connected = False
    
    def disconnect(self):
        """Disconnect from MongoDB"""
        try:
            if self.connected:
                disconnect()
                self.connected = False
                logger.info("Disconnected from MongoDB")
        except Exception as e:
            logger.error(f"Error disconnecting from MongoDB: {e}")
    
    def save_emergency_report(self, report_data):
        """Save emergency report to MongoDB"""
        try:
            self.connect()
            report = EmergencyReport(**report_data)
            report.save()
            return report
        except Exception as e:
            logger.error(f"Error saving emergency report to MongoDB: {e}")
            return None
    
    def get_emergency_reports(self, filters=None, limit=100):
        """Get emergency reports from MongoDB"""
        try:
            self.connect()
            query = EmergencyReport.objects
            if filters:
                query = query.filter(**filters)
            return query.order_by('-created_at').limit(limit)
        except Exception as e:
            logger.error(f"Error getting emergency reports from MongoDB: {e}")
            return []
    
    def save_analytics_data(self, data_type, data, user_id=None):
        """Save analytics data to MongoDB"""
        try:
            self.connect()
            analytics = AnalyticsData(
                data_type=data_type,
                data=data,
                user_id=user_id
            )
            analytics.save()
            return analytics
        except Exception as e:
            logger.error(f"Error saving analytics data to MongoDB: {e}")
            return None
    
    def get_analytics_data(self, data_type, user_id=None, limit=100):
        """Get analytics data from MongoDB"""
        try:
            self.connect()
            query = AnalyticsData.objects(data_type=data_type)
            if user_id:
                query = query.filter(user_id=user_id)
            return query.order_by('-timestamp').limit(limit)
        except Exception as e:
            logger.error(f"Error getting analytics data from MongoDB: {e}")
            return []
    
    def log_notification(self, user_id, notification_type, message, metadata=None):
        """Log notification to MongoDB"""
        try:
            self.connect()
            notification = NotificationLog(
                user_id=user_id,
                notification_type=notification_type,
                message=message,
                metadata=metadata or {}
            )
            notification.save()
            return notification
        except Exception as e:
            logger.error(f"Error logging notification to MongoDB: {e}")
            return None
    
    def log_system_event(self, level, message, module=None, user_id=None, metadata=None):
        """Log system event to MongoDB"""
        try:
            self.connect()
            log_entry = SystemLog(
                level=level,
                message=message,
                module=module,
                user_id=user_id,
                metadata=metadata or {}
            )
            log_entry.save()
            return log_entry
        except Exception as e:
            logger.error(f"Error logging system event to MongoDB: {e}")
            return None
    
    def get_geospatial_reports(self, lat, lng, radius_km=10):
        """Get emergency reports within a radius (geospatial query)"""
        try:
            self.connect()
            # MongoDB geospatial query
            reports = EmergencyReport.objects(
                location__geo_within_center=[[lng, lat], radius_km/111.32]  # Convert km to degrees
            )
            return reports
        except Exception as e:
            logger.error(f"Error getting geospatial reports from MongoDB: {e}")
            return []

# Global MongoDB service instance
mongodb_service = MongoDBService()
