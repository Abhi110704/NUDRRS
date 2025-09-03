#!/usr/bin/env python
import os
import django
from datetime import datetime, timedelta
import random
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from django.contrib.auth.models import User
from sos_reports.models import SOSReport
from resources.models import ResourceType, Resource, ResourceDeployment
from notifications.models import NotificationTemplate, Notification, AlertSubscription
from analytics.models import SystemMetrics, ResponseTimeLog, AIAccuracyLog

def create_demo_data():
    print("Creating demo data for NUDRRS...")
    
    # Create demo users if they don't exist
    demo_users = []
    for i in range(1, 6):
        username = f'citizen{i}'
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=f'citizen{i}@example.com',
                password='demo123',
                first_name=f'Citizen',
                last_name=f'{i}'
            )
            demo_users.append(user)
        else:
            demo_users.append(User.objects.get(username=username))
    
    # Create SOS Reports
    disaster_types = ['FLOOD', 'EARTHQUAKE', 'FIRE', 'LANDSLIDE', 'CYCLONE', 'ACCIDENT', 'MEDICAL']
    priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    statuses = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM']
    
    locations = [
        {'address': 'Sector 15, Chandigarh, Punjab', 'lat': 30.7333, 'lng': 76.7794},
        {'address': 'Industrial Area, Gurgaon, Haryana', 'lat': 28.4595, 'lng': 77.0266},
        {'address': 'Hill Station Road, Shimla, Himachal Pradesh', 'lat': 31.1048, 'lng': 77.1734},
        {'address': 'Mountain View, Dehradun, Uttarakhand', 'lat': 30.3165, 'lng': 78.0322},
        {'address': 'Coastal Area, Visakhapatnam, Andhra Pradesh', 'lat': 17.6868, 'lng': 83.2185},
        {'address': 'Tech City, Bangalore, Karnataka', 'lat': 12.9716, 'lng': 77.5946},
        {'address': 'Marine Drive, Mumbai, Maharashtra', 'lat': 18.9220, 'lng': 72.8347},
        {'address': 'Red Fort Area, Delhi', 'lat': 28.6562, 'lng': 77.2410},
        {'address': 'Park Street, Kolkata, West Bengal', 'lat': 22.5726, 'lng': 88.3639},
        {'address': 'Anna Nagar, Chennai, Tamil Nadu', 'lat': 13.0827, 'lng': 80.2707}
    ]
    
    descriptions = [
        'Heavy rainfall causing waterlogging in residential areas. Multiple families need evacuation.',
        'Factory fire spreading rapidly. Fire department on site, need additional resources.',
        'Minor earthquake reported, checking for structural damages in old buildings.',
        'Road blocked due to landslide. Emergency clearance required.',
        'Cyclone warning issued. Evacuation of coastal villages in progress.',
        'Multi-vehicle accident on highway. Medical assistance required urgently.',
        'Building collapse reported. Search and rescue operations needed.',
        'Gas leak detected in residential complex. Area evacuation in progress.',
        'Flash flood in low-lying areas. Boats needed for rescue operations.',
        'Forest fire spreading towards residential areas. Firefighting support required.'
    ]
    
    print("Creating SOS Reports...")
    for i in range(25):
        location = random.choice(locations)
        created_time = timezone.now() - timedelta(hours=random.randint(1, 72))
        SOSReport.objects.get_or_create(
            user=random.choice(demo_users),
            disaster_type=random.choice(disaster_types),
            priority=random.choice(priorities),
            status=random.choice(statuses),
            description=random.choice(descriptions),
            address=location['address'],
            latitude=location['lat'],
            longitude=location['lng'],
            phone_number=f'+91{random.randint(7000000000, 9999999999)}',
            defaults={'created_at': created_time}
        )
    
    # Create Resource Types
    print("Creating Resource Types...")
    resource_types_data = [
        {'name': 'NDRF Team', 'description': 'National Disaster Response Force personnel'},
        {'name': 'Fire Truck', 'description': 'Fire fighting vehicle with equipment'},
        {'name': 'Ambulance', 'description': 'Medical emergency vehicle'},
        {'name': 'Rescue Boat', 'description': 'Water rescue vessel'},
        {'name': 'Helicopter', 'description': 'Air rescue and surveillance'},
        {'name': 'Medical Team', 'description': 'Emergency medical personnel'},
        {'name': 'Food Supplies', 'description': 'Emergency food and water'},
        {'name': 'Shelter Kit', 'description': 'Temporary shelter materials'}
    ]
    
    for rt_data in resource_types_data:
        ResourceType.objects.get_or_create(
            name=rt_data['name'],
            defaults={'description': rt_data['description']}
        )
    
    # Create Resources
    print("Creating Resources...")
    resource_types = ResourceType.objects.all()
    resource_locations = [
        'Delhi NDRF Base', 'Mumbai Fire Station', 'Bangalore Medical Center',
        'Chennai Coast Guard', 'Kolkata Emergency Hub', 'Hyderabad Rescue Center'
    ]
    
    for i in range(30):
        location = random.choice(locations)
        resource_type = random.choice(resource_types)
        Resource.objects.get_or_create(
            resource_type=resource_type,
            name=f'{resource_type.name} Unit {i+1}',
            defaults={
                'status': random.choice(['AVAILABLE', 'DEPLOYED', 'MAINTENANCE']),
                'address': random.choice(resource_locations),
                'latitude': location['lat'],
                'longitude': location['lng'],
                'capacity': random.randint(5, 50),
                'contact_number': f'+91{random.randint(7000000000, 9999999999)}',
                'description': f'Emergency {resource_type.name} for disaster response operations'
            }
        )
    
    # Create Resource Deployments
    print("Creating Resource Deployments...")
    reports = SOSReport.objects.filter(status__in=['VERIFIED', 'IN_PROGRESS'])[:10]
    resources = Resource.objects.filter(status='AVAILABLE')[:10]
    
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = demo_users[0]  # fallback to first demo user
    
    for i, report in enumerate(reports):
        if i < len(resources):
            ResourceDeployment.objects.get_or_create(
                resource=resources[i],
                report=report,
                defaults={
                    'deployed_by': admin_user,
                    'estimated_arrival': timezone.now() + timedelta(minutes=random.randint(15, 120)),
                    'status': random.choice(['DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED']),
                    'notes': f'Deployed for {report.disaster_type} emergency response'
                }
            )
    
    # Create Notification Templates
    print("Creating Notification Templates...")
    templates_data = [
        {
            'name': 'Emergency Alert',
            'template': 'URGENT: Emergency Reported in Your Area. An emergency has been reported near your location. Please stay safe and follow local authorities instructions.'
        },
        {
            'name': 'Resource Deployed',
            'template': 'Emergency Response: Help is on the way. Emergency resources have been deployed to your location. Estimated arrival: {eta}'
        },
        {
            'name': 'Weather Warning',
            'template': 'Weather Alert: {disaster_type} Warning. Severe weather conditions expected in your area. Please take necessary precautions.'
        }
    ]
    
    for template_data in templates_data:
        NotificationTemplate.objects.get_or_create(
            name=template_data['name'],
            defaults={
                'template': template_data['template'],
                'notification_type': 'EMAIL'
            }
        )
    
    # Create Notifications
    print("Creating Notifications...")
    templates = NotificationTemplate.objects.all()
    for i in range(15):
        user = random.choice(demo_users)
        Notification.objects.get_or_create(
            recipient=user.email or f'{user.username}@example.com',
            defaults={
                'message': f'Emergency Notification {i+1}: This is a demo emergency notification for testing purposes.',
                'notification_type': random.choice(['EMAIL', 'SMS', 'PUSH']),
                'status': random.choice(['SENT', 'DELIVERED', 'FAILED']),
                'report': random.choice(SOSReport.objects.all()[:10]) if SOSReport.objects.exists() else None,
                'sent_at': timezone.now() - timedelta(hours=random.randint(1, 48))
            }
        )
    
    # Create Alert Subscriptions
    print("Creating Alert Subscriptions...")
    for user in demo_users:
        AlertSubscription.objects.get_or_create(
            user=user,
            defaults={
                'alert_type': random.choice(['ALL', 'FLOOD', 'FIRE', 'EARTHQUAKE', 'HIGH_PRIORITY']),
                'phone_number': f'+91{random.randint(7000000000, 9999999999)}',
                'email': user.email or f'{user.username}@example.com',
                'is_active': True
            }
        )
    
    # Create System Metrics
    print("Creating System Metrics...")
    metrics_data = [
        {'name': 'Response Time', 'value': 15.5, 'unit': 'minutes'},
        {'name': 'System Uptime', 'value': 99.8, 'unit': '%'},
        {'name': 'Active Users', 'value': 1247, 'unit': 'users'},
        {'name': 'Reports Processed', 'value': 89, 'unit': 'reports/hour'},
        {'name': 'Resource Utilization', 'value': 78.5, 'unit': '%'}
    ]
    
    for metric in metrics_data:
        SystemMetrics.objects.get_or_create(
            metric_name=metric['name'],
            defaults={
                'metric_value': metric['value'],
                'metric_unit': metric['unit']
            }
        )
    
    # Create Response Time Logs
    print("Creating Response Time Logs...")
    resolved_reports = SOSReport.objects.filter(status='RESOLVED')[:10]
    for report in resolved_reports:
        ResponseTimeLog.objects.get_or_create(
            report=report,
            defaults={
                'response_time_minutes': random.randint(5, 180)
            }
        )
    
    # Create AI Accuracy Logs
    print("Creating AI Accuracy Logs...")
    for report in resolved_reports:
        AIAccuracyLog.objects.get_or_create(
            report=report,
            defaults={
                'predicted_priority': random.choice(priorities),
                'actual_priority': report.priority,
                'accuracy_score': random.uniform(75.0, 98.5)
            }
        )
    
    # Create additional Analytics data
    print("Creating additional Analytics data...")
    
    # More system metrics for analytics dashboard
    additional_metrics = [
        {'name': 'API Response Time', 'value': 245, 'unit': 'ms'},
        {'name': 'Database Queries/sec', 'value': 156, 'unit': 'queries/sec'},
        {'name': 'Memory Usage', 'value': 67.3, 'unit': '%'},
        {'name': 'CPU Usage', 'value': 23.8, 'unit': '%'},
        {'name': 'Network Throughput', 'value': 89.2, 'unit': 'Mbps'},
        {'name': 'Error Rate', 'value': 0.02, 'unit': '%'},
        {'name': 'User Sessions', 'value': 342, 'unit': 'active'},
        {'name': 'Reports/Day', 'value': 47, 'unit': 'reports'},
        {'name': 'Resolution Rate', 'value': 94.5, 'unit': '%'},
        {'name': 'Average Response Time', 'value': 18.3, 'unit': 'minutes'}
    ]
    
    for metric in additional_metrics:
        SystemMetrics.objects.get_or_create(
            metric_name=metric['name'],
            defaults={
                'metric_value': metric['value'],
                'metric_unit': metric['unit']
            }
        )
    
    # Create more response time logs for better analytics
    all_reports = SOSReport.objects.all()[:20]
    for report in all_reports:
        if not ResponseTimeLog.objects.filter(report=report).exists():
            ResponseTimeLog.objects.create(
                report=report,
                response_time_minutes=random.randint(3, 240)
            )
    
    # Create more AI accuracy logs
    for report in all_reports:
        if not AIAccuracyLog.objects.filter(report=report).exists():
            AIAccuracyLog.objects.create(
                report=report,
                predicted_priority=random.choice(priorities),
                actual_priority=report.priority,
                accuracy_score=random.uniform(70.0, 99.2)
            )
    
    print("✅ Demo data created successfully!")
    print(f"📊 Created:")
    print(f"   - {SOSReport.objects.count()} SOS Reports")
    print(f"   - {Resource.objects.count()} Resources") 
    print(f"   - {ResourceDeployment.objects.count()} Resource Deployments")
    print(f"   - {Notification.objects.count()} Notifications")
    print(f"   - {SystemMetrics.objects.count()} System Metrics")
    print(f"   - {ResponseTimeLog.objects.count()} Response Time Logs")
    print(f"   - {AIAccuracyLog.objects.count()} AI Accuracy Logs")
    print(f"🚀 Ready for demo at http://127.0.0.1:8000/admin/")

if __name__ == '__main__':
    create_demo_data()
