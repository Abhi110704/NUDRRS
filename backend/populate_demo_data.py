#!/usr/bin/env python
"""
Populate demo data for NUDRRS system
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from django.contrib.auth.models import User
from sos_reports.models import SOSReport
from authentication.models import UserProfile, Organization

def create_demo_data():
    """Create demo SOS reports for testing"""
    
    # Create demo user if not exists
    demo_user, created = User.objects.get_or_create(
        username='demo_user',
        defaults={
            'email': 'demo@nudrrs.com',
            'first_name': 'Demo',
            'last_name': 'User',
            'is_staff': True
        }
    )
    
    if created:
        demo_user.set_password('demo123')
        demo_user.save()
        print(f"Created demo user: {demo_user.username}")
    
    # Create demo organization if not exists
    demo_org, created = Organization.objects.get_or_create(
        name='Demo Emergency Response Team',
        defaults={
            'org_type': 'GOVERNMENT',
            'address': 'Demo Address, Demo City',
            'contact_person': 'Demo Contact',
            'contact_email': 'contact@demo.org',
            'contact_phone': '+91-9876543210'
        }
    )
    
    if created:
        print(f"Created demo organization: {demo_org.name}")
    
    # Create demo SOS reports
    disaster_types = ['FLOOD', 'FIRE', 'EARTHQUAKE', 'LANDSLIDE', 'CYCLONE', 'MEDICAL']
    priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    statuses = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']
    
    demo_reports = [
        {
            'disaster_type': 'FLOOD',
            'priority': 'HIGH',
            'status': 'PENDING',
            'description': 'Heavy rainfall causing waterlogging in residential areas. Multiple families need evacuation.',
            'address': 'Sector 15, Chandigarh, Punjab',
            'latitude': 30.7333,
            'longitude': 76.7794,
            'is_demo': True
        },
        {
            'disaster_type': 'FIRE',
            'priority': 'CRITICAL',
            'status': 'IN_PROGRESS',
            'description': 'Factory fire spreading rapidly. Fire department on site, need additional resources.',
            'address': 'Industrial Area, Gurgaon, Haryana',
            'latitude': 28.4595,
            'longitude': 77.0266,
            'is_demo': True
        },
        {
            'disaster_type': 'EARTHQUAKE',
            'priority': 'MEDIUM',
            'status': 'VERIFIED',
            'description': 'Minor earthquake reported, checking for structural damages in old buildings.',
            'address': 'Hill Station Road, Shimla, Himachal Pradesh',
            'latitude': 31.1048,
            'longitude': 77.1734,
            'is_demo': True
        },
        {
            'disaster_type': 'LANDSLIDE',
            'priority': 'HIGH',
            'status': 'RESOLVED',
            'description': 'Road blocked due to landslide. Cleared successfully, traffic restored.',
            'address': 'Mountain View, Dehradun, Uttarakhand',
            'latitude': 30.3165,
            'longitude': 78.0322,
            'is_demo': True
        },
        {
            'disaster_type': 'CYCLONE',
            'priority': 'CRITICAL',
            'status': 'PENDING',
            'description': 'Cyclone warning issued. Evacuation of coastal villages in progress.',
            'address': 'Coastal Area, Visakhapatnam, Andhra Pradesh',
            'latitude': 17.6868,
            'longitude': 83.2185,
            'is_demo': True
        },
        {
            'disaster_type': 'MEDICAL',
            'priority': 'HIGH',
            'status': 'IN_PROGRESS',
            'description': 'Medical emergency - multiple casualties from building collapse.',
            'address': 'Old City, Ahmedabad, Gujarat',
            'latitude': 23.0225,
            'longitude': 72.5714,
            'is_demo': True
        }
    ]
    
    created_count = 0
    for i, report_data in enumerate(demo_reports):
        # Add some variation to timestamps
        timestamp = datetime.now() - timedelta(hours=random.randint(1, 24))
        
        report, created = SOSReport.objects.get_or_create(
            id=i+1,
            defaults={
                'user': demo_user,
                'disaster_type': report_data['disaster_type'],
                'priority': report_data['priority'],
                'status': report_data['status'],
                'description': report_data['description'],
                'address': report_data['address'],
                'latitude': report_data['latitude'],
                'longitude': report_data['longitude'],
                'is_demo': report_data['is_demo'],
                'created_at': timestamp,
                'ai_confidence': random.uniform(0.7, 0.98)
            }
        )
        
        if created:
            created_count += 1
            print(f"Created demo report: {report.disaster_type} - {report.status}")
    
    print(f"\nDemo data population complete!")
    print(f"Created {created_count} demo SOS reports")
    print(f"Demo user: {demo_user.username} (password: demo123)")
    print(f"Demo organization: {demo_org.name}")

if __name__ == '__main__':
    create_demo_data()
