#!/usr/bin/env python
"""
Script to create admin user for NUDRRS
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from apps.accounts.models import User

def create_admin():
    """Create admin user"""
    try:
        # Check if admin already exists
        if User.objects.filter(username='admin').exists():
            print("Admin user already exists!")
            admin = User.objects.get(username='admin')
            admin.set_password('admin123')
            admin.save()
            print("Admin password updated to: admin123")
        else:
            # Create new admin user
            admin = User.objects.create_user(
                username='admin',
                email='admin@nudrrs.gov.in',
                password='admin123',
                first_name='System',
                last_name='Administrator',
                role='admin',
                is_staff=True,
                is_superuser=True
            )
            print("Admin user created successfully!")
            print("Username: admin")
            print("Email: admin@nudrrs.gov.in")
            print("Password: admin123")
        
        # Create sample users
        create_sample_users()
        
    except Exception as e:
        print(f"Error creating admin: {e}")

def create_sample_users():
    """Create sample users for testing"""
    try:
        # Create responder user
        if not User.objects.filter(username='responder1').exists():
            User.objects.create_user(
                username='responder1',
                email='responder@nudrrs.gov.in',
                password='responder123',
                first_name='Emergency',
                last_name='Responder',
                role='responder',
                phone_number='+919876543210'
            )
            print("Responder user created!")
        
        # Create citizen user
        if not User.objects.filter(username='citizen1').exists():
            User.objects.create_user(
                username='citizen1',
                email='citizen@example.com',
                password='citizen123',
                first_name='John',
                last_name='Doe',
                role='citizen',
                phone_number='+919876543211'
            )
            print("Citizen user created!")
            
    except Exception as e:
        print(f"Error creating sample users: {e}")

if __name__ == '__main__':
    create_admin()
