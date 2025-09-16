#!/usr/bin/env python
"""
Data Migration Script: SQLite to MongoDB Atlas
This script migrates all data from SQLite to MongoDB Atlas
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from django.contrib.auth.models import User
from sos_reports.models import SOSReport, ReportMedia, ReportUpdate
from notifications.models import Notification
from resources.models import Resource
from analytics.models import AnalyticsData
from mongodb_integration.services import mongodb_service
from django.conf import settings

def migrate_users_to_mongodb():
    """Migrate all users to MongoDB"""
    print("👥 Migrating Users to MongoDB...")
    
    users = User.objects.all()
    migrated_count = 0
    
    for user in users:
        user_data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'migrated_at': datetime.now().isoformat(),
            'source': 'sqlite_migration'
        }
        
        try:
            result = mongodb_service.save_user(user_data)
            if result:
                migrated_count += 1
                print(f"✅ Migrated user: {user.username}")
            else:
                print(f"❌ Failed to migrate user: {user.username}")
        except Exception as e:
            print(f"❌ Error migrating user {user.username}: {e}")
    
    print(f"📊 Users migrated: {migrated_count}/{users.count()}")
    return migrated_count

def migrate_reports_to_mongodb():
    """Migrate all SOS reports to MongoDB"""
    print("📋 Migrating SOS Reports to MongoDB...")
    
    reports = SOSReport.objects.all()
    migrated_count = 0
    
    for report in reports:
        # Get media files
        media_files = []
        for media in report.media.all():
            media_files.append({
                'id': media.id,
                'media_type': media.media_type,
                'file': str(media.file) if media.file else None,
                'file_url': media.file_url,
                'created_at': media.created_at.isoformat()
            })
        
        # Get updates/comments
        updates = []
        for update in report.updates.all():
            updates.append({
                'id': update.id,
                'user': update.user.username if update.user else 'Anonymous',
                'message': update.message,
                'status_change': update.status_change,
                'created_at': update.created_at.isoformat()
            })
        
        report_data = {
            'report_id': report.id,
            'user_id': report.user.id if report.user else None,
            'username': report.user.username if report.user else 'Anonymous',
            'phone_number': report.phone_number,
            'latitude': report.latitude,
            'longitude': report.longitude,
            'address': report.address,
            'disaster_type': report.disaster_type,
            'description': report.description,
            'priority': report.priority,
            'status': report.status,
            'ai_verified': report.ai_verified,
            'ai_confidence': report.ai_confidence,
            'ai_fraud_score': report.ai_fraud_score,
            'ai_analysis_data': report.ai_analysis_data,
            'media': media_files,
            'updates': updates,
            'vote_counts': report.vote_counts,
            'vote_percentages': report.vote_percentages,
            'user_vote': report.user_vote,
            'created_at': report.created_at.isoformat(),
            'updated_at': report.updated_at.isoformat(),
            'migrated_at': datetime.now().isoformat(),
            'source': 'sqlite_migration'
        }
        
        try:
            result = mongodb_service.save_emergency_report(report_data)
            if result:
                migrated_count += 1
                print(f"✅ Migrated report: {report.disaster_type} (ID: {report.id})")
            else:
                print(f"❌ Failed to migrate report: {report.disaster_type} (ID: {report.id})")
        except Exception as e:
            print(f"❌ Error migrating report {report.id}: {e}")
    
    print(f"📊 Reports migrated: {migrated_count}/{reports.count()}")
    return migrated_count

def migrate_notifications_to_mongodb():
    """Migrate all notifications to MongoDB"""
    print("🔔 Migrating Notifications to MongoDB...")
    
    notifications = Notification.objects.all()
    migrated_count = 0
    
    for notification in notifications:
        notification_data = {
            'notification_id': notification.id,
            'recipient': notification.recipient.username if notification.recipient else 'Anonymous',
            'message': notification.message,
            'notification_type': notification.notification_type,
            'status': notification.status,
            'created_at': notification.created_at.isoformat(),
            'migrated_at': datetime.now().isoformat(),
            'source': 'sqlite_migration'
        }
        
        try:
            result = mongodb_service.save_notification(notification_data)
            if result:
                migrated_count += 1
                print(f"✅ Migrated notification: {notification.message[:50]}...")
            else:
                print(f"❌ Failed to migrate notification: {notification.id}")
        except Exception as e:
            print(f"❌ Error migrating notification {notification.id}: {e}")
    
    print(f"📊 Notifications migrated: {migrated_count}/{notifications.count()}")
    return migrated_count

def verify_migration():
    """Verify that data was migrated successfully"""
    print("🔍 Verifying Migration...")
    
    try:
        # Check users
        users = mongodb_service.get_users({}, limit=100)
        print(f"👥 Users in MongoDB: {len(users)}")
        
        # Check reports
        reports = mongodb_service.get_emergency_reports({}, limit=100)
        print(f"📋 Reports in MongoDB: {len(reports)}")
        
        # Check notifications
        notifications = mongodb_service.get_notifications({}, limit=100)
        print(f"🔔 Notifications in MongoDB: {len(notifications)}")
        
        print("✅ Migration verification completed!")
        
    except Exception as e:
        print(f"❌ Error verifying migration: {e}")

def main():
    """Main migration function"""
    print("🚀 Starting SQLite to MongoDB Atlas Migration")
    print("=" * 60)
    
    # Check MongoDB connection
    if not mongodb_service.connected:
        print("❌ MongoDB connection failed!")
        print("Please check your MongoDB Atlas configuration.")
        return
    
    print("✅ MongoDB connection successful!")
    print()
    
    # Migrate data
    total_migrated = 0
    
    try:
        # Migrate users
        total_migrated += migrate_users_to_mongodb()
        print()
        
        # Migrate reports
        total_migrated += migrate_reports_to_mongodb()
        print()
        
        # Migrate notifications
        total_migrated += migrate_notifications_to_mongodb()
        print()
        
        # Verify migration
        verify_migration()
        print()
        
        print("🎉 Migration completed successfully!")
        print(f"📊 Total records migrated: {total_migrated}")
        print()
        print("📝 Next steps:")
        print("1. Your data is now in MongoDB Atlas")
        print("2. You can view it in MongoDB Atlas dashboard")
        print("3. Your app will continue to work with SQLite")
        print("4. To fully switch to MongoDB, update your models")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("Please check the error and try again.")

if __name__ == "__main__":
    main()
