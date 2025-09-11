#!/usr/bin/env python
"""
Simple script to run the Django development server
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nudrrs.settings")
    django.setup()
    
    # Run migrations first
    print("Running migrations...")
    execute_from_command_line(["manage.py", "migrate"])
    
    # Create superuser if it doesn't exist
    from django.contrib.auth.models import User
    from authentication.models import UserProfile
    if not User.objects.filter(username='admin').exists():
        print("Creating admin user...")
        admin_user = User.objects.create_superuser('admin', 'admin@nudrrs.com', 'admin123')
        
        # Create admin profile with ADMIN role
        UserProfile.objects.create(
            user=admin_user,
            role='ADMIN',
            phone_number='+919876543210',
            is_active=True
        )
        print("Admin user created: username=admin, password=admin123, role=ADMIN")
    
    # Run the server
    print("Starting Django development server...")
    execute_from_command_line(["manage.py", "runserver", "0.0.0.0:8000"])
