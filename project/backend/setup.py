#!/usr/bin/env python
"""
NUDRRS Backend Setup Script
Run this to set up the Django backend for SIH 2025
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Set up Django project"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
    django.setup()
    
    print("🚀 Setting up NUDRRS Backend...")
    
    # Create migrations
    print("📝 Creating migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    # Run migrations
    print("🗄️ Running migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create superuser
    print("👤 Creating superuser...")
    print("Use these credentials:")
    print("Username: admin")
    print("Email: admin@nudrrs.gov.in")
    print("Password: admin123")
    
    # Create sample data
    print("📊 Creating sample data...")
    create_sample_data()
    
    print("✅ Setup complete! Run 'python manage.py runserver' to start the server")

def create_sample_data():
    """Create sample data for testing"""
    from apps.accounts.models import User
    from apps.sos_reports.models import EmergencyResource
    from apps.chatbot.models import EmergencyFAQ, EmergencyContact
    
    # Create admin user
    if not User.objects.filter(username='admin').exists():
        User.objects.create_user(
            username='admin',
            email='admin@nudrrs.gov.in',
            password='admin123',
            first_name='System',
            last_name='Administrator',
            role='admin'
        )
        print("✅ Admin user created")
    
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
        print("✅ Responder user created")
    
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
        print("✅ Citizen user created")
    
    # Create sample emergency resource
    if not EmergencyResource.objects.filter(name='Ambulance Unit 1').exists():
        EmergencyResource.objects.create(
            name='Ambulance Unit 1',
            resource_type='ambulance',
            description='Medical emergency ambulance',
            location_latitude=28.6139,
            location_longitude=77.2090,
            capacity=1,
            available_capacity=1,
            contact_person='Dr. Rajesh Kumar',
            contact_phone='+919876543211'
        )
        print("✅ Sample emergency resource created")
    
    # Create sample FAQ
    if not EmergencyFAQ.objects.filter(question='What should I do during a flood?').exists():
        EmergencyFAQ.objects.create(
            question='What should I do during a flood?',
            answer='Move to higher ground immediately. Do not walk through floodwaters. Call emergency services.',
            category='general',
            language='en',
            priority=10
        )
        print("✅ Sample FAQ created")
    
    # Create sample emergency contact
    if not EmergencyContact.objects.filter(name='Delhi Police Emergency').exists():
        EmergencyContact.objects.create(
            name='Delhi Police Emergency',
            contact_type='police',
            phone_number='100',
            email='emergency@delhipolice.gov.in',
            address='Delhi Police Headquarters',
            is_24_7=True,
            languages_supported=['en', 'hi']
        )
        print("✅ Sample emergency contact created")

if __name__ == '__main__':
    setup_django()
