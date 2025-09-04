# NUDRRS Backend Setup Commands

## 1. Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
```

## 2. Install Dependencies
```bash
pip install -r requirements.txt
```

## 3. Create Environment File
```bash
copy env_example.txt .env
# Edit .env file with your actual values
```

## 4. Run Django Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## 5. Create Superuser
```bash
python manage.py createsuperuser
```

## 6. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

## 7. Run Development Server
```bash
python manage.py runserver
```

## 8. Create Sample Data (Optional)
```bash
python manage.py shell
# Run the following in Django shell:
from apps.accounts.models import User
from apps.sos_reports.models import SOSReport, EmergencyResource
from apps.chatbot.models import EmergencyFAQ, EmergencyContact

# Create sample users
admin_user = User.objects.create_user(
    username='admin',
    email='admin@nudrrs.gov.in',
    password='admin123',
    first_name='System',
    last_name='Administrator',
    role='admin'
)

responder_user = User.objects.create_user(
    username='responder1',
    email='responder@nudrrs.gov.in',
    password='responder123',
    first_name='Emergency',
    last_name='Responder',
    role='responder',
    phone_number='+919876543210'
)

# Create sample emergency resources
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

# Create sample FAQ
EmergencyFAQ.objects.create(
    question='What should I do during a flood?',
    answer='Move to higher ground immediately. Do not walk through floodwaters. Call emergency services.',
    category='general',
    language='en',
    priority=10
)

# Create sample emergency contact
EmergencyContact.objects.create(
    name='Delhi Police Emergency',
    contact_type='police',
    phone_number='100',
    email='emergency@delhipolice.gov.in',
    address='Delhi Police Headquarters',
    is_24_7=True,
    languages_supported=['en', 'hi']
)
```

## 9. API Endpoints Available

### Authentication
- POST `/api/auth/register/` - User registration
- POST `/api/auth/login/` - User login
- POST `/api/auth/logout/` - User logout
- GET/PUT `/api/auth/profile/` - User profile

### SOS Reports
- GET/POST `/api/sos/` - List/Create SOS reports
- GET/PUT/DELETE `/api/sos/{id}/` - SOS report detail
- POST `/api/sos/{id}/assign/` - Assign report to responder
- POST `/api/sos/{id}/status/` - Update report status
- GET `/api/sos/nearby/` - Get nearby reports

### Emergency Resources
- GET/POST `/api/sos/resources/` - List/Create emergency resources
- GET/PUT/DELETE `/api/sos/resources/{id}/` - Resource detail

## 10. Frontend Integration

The backend is now ready to be integrated with your React frontend. The API endpoints are configured with CORS to allow requests from:
- http://localhost:3000
- http://localhost:5173

## 11. Next Steps

1. Test the API endpoints using Postman or curl
2. Integrate with your React frontend
3. Add AI/ML features for report classification
4. Implement real-time notifications
5. Add mapping and visualization features
