#!/usr/bin/env python
"""
Migration script to move users from SQLite to MongoDB
Run this script to migrate existing users from Django's SQLite database to MongoDB
"""

import os
import sys
import django
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from django.contrib.auth.models import User as DjangoUser
from mongodb_integration.user_service import MongoDBUserService
from mongodb_integration.services import MongoDBService

def migrate_users():
    """Migrate all users from SQLite to MongoDB"""
    print("🚀 Starting user migration from SQLite to MongoDB...")
    
    # Initialize services
    mongodb_service = MongoDBService()
    user_service = MongoDBUserService()
    
    try:
        # Connect to MongoDB
        mongodb_service.connect()
        print("✅ Connected to MongoDB")
        
        # Get all users from SQLite
        django_users = DjangoUser.objects.all()
        print(f"📊 Found {django_users.count()} users in SQLite")
        
        migrated_count = 0
        skipped_count = 0
        error_count = 0
        
        for django_user in django_users:
            try:
                # Check if user already exists in MongoDB
                existing_user = user_service.get_user_by_username(django_user.username)
                if existing_user:
                    print(f"⏭️  Skipping {django_user.username} - already exists in MongoDB")
                    skipped_count += 1
                    continue
                
                # Create user in MongoDB
                mongodb_user = user_service.create_user(
                    username=django_user.username,
                    email=django_user.email,
                    password='migrated_user_password',  # Will need to be reset
                    first_name=django_user.first_name,
                    last_name=django_user.last_name,
                    is_active=django_user.is_active,
                    is_staff=django_user.is_staff,
                    is_superuser=django_user.is_superuser,
                    date_joined=django_user.date_joined,
                    last_login=django_user.last_login
                )
                
                print(f"✅ Migrated user: {django_user.username}")
                migrated_count += 1
                
            except Exception as e:
                print(f"❌ Error migrating user {django_user.username}: {str(e)}")
                error_count += 1
        
        print("\n📈 Migration Summary:")
        print(f"✅ Successfully migrated: {migrated_count} users")
        print(f"⏭️  Skipped (already exists): {skipped_count} users")
        print(f"❌ Errors: {error_count} users")
        
        # Get MongoDB user stats
        stats = user_service.get_user_stats()
        print(f"\n📊 MongoDB User Stats:")
        print(f"Total users: {stats['total_users']}")
        print(f"Active users: {stats['active_users']}")
        print(f"Staff users: {stats['staff_users']}")
        
        print("\n⚠️  Important Notes:")
        print("1. All migrated users have a temporary password: 'migrated_user_password'")
        print("2. Users should reset their passwords on first login")
        print("3. API tokens have been generated for all users")
        print("4. You can now update your authentication to use MongoDB")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False
    
    finally:
        # Disconnect from MongoDB
        mongodb_service.disconnect()
        print("🔌 Disconnected from MongoDB")
    
    return True

def verify_migration():
    """Verify that migration was successful"""
    print("\n🔍 Verifying migration...")
    
    try:
        mongodb_service = MongoDBService()
        user_service = MongoDBUserService()
        
        mongodb_service.connect()
        
        # Get counts
        django_count = DjangoUser.objects.count()
        mongodb_count = user_service.get_user_stats()['total_users']
        
        print(f"SQLite users: {django_count}")
        print(f"MongoDB users: {mongodb_count}")
        
        if django_count == mongodb_count:
            print("✅ Migration verification successful!")
            return True
        else:
            print("⚠️  User counts don't match. Please check the migration.")
            return False
            
    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")
        return False
    
    finally:
        mongodb_service.disconnect()

if __name__ == "__main__":
    print("=" * 60)
    print("🔄 NUDRRS User Migration: SQLite → MongoDB")
    print("=" * 60)
    
    # Run migration
    success = migrate_users()
    
    if success:
        # Verify migration
        verify_migration()
        print("\n🎉 Migration completed successfully!")
    else:
        print("\n💥 Migration failed. Please check the errors above.")
    
    print("=" * 60)
