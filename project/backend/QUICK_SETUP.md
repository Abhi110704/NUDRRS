# 🚀 NUDRRS Backend - Quick Setup Commands

## ✅ Fixed Installation Commands

The Pillow version has been updated to fix the installation error. Run these commands:

```bash
# 1. Install dependencies (fixed version)
pip install -r requirements.txt

# 2. Create environment file
copy env_file.txt .env

# 3. Run migrations
python manage.py makemigrations
python manage.py migrate

# 4. Create superuser
python manage.py createsuperuser

# 5. Run development server
python manage.py runserver
```

## 🔧 If you still get Pillow errors, try:

```bash
# Alternative: Install Pillow separately first
pip install Pillow==9.5.0
pip install -r requirements.txt
```

## 📊 Sample Data Creation

After running migrations, create sample data:

```python
# Run in Django shell: python manage.py shell

from apps.accounts.models import User
from apps.sos_reports.models import EmergencyResource
from apps.chatbot.models import EmergencyFAQ, EmergencyContact

# Create admin user
admin_user = User.objects.create_user(
    username='admin',
    email='admin@nudrrs.gov.in',
    password='admin123',
    first_name='System',
    last_name='Administrator',
    role='admin'
)

# Create responder user
responder_user = User.objects.create_user(
    username='responder1',
    email='responder@nudrrs.gov.in',
    password='responder123',
    first_name='Emergency',
    last_name='Responder',
    role='responder',
    phone_number='+919876543210'
)

# Create citizen user
citizen_user = User.objects.create_user(
    username='citizen1',
    email='citizen@example.com',
    password='citizen123',
    first_name='John',
    last_name='Doe',
    role='citizen',
    phone_number='+919876543211'
)

# Create sample emergency resource
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

## 🌐 API Endpoints Ready

Once the server is running, these endpoints will be available:

### Authentication
- `POST http://localhost:8000/api/auth/register/`
- `POST http://localhost:8000/api/auth/login/`
- `GET http://localhost:8000/api/auth/profile/`

### SOS Reports
- `GET/POST http://localhost:8000/api/sos/`
- `GET http://localhost:8000/api/sos/nearby/`

### Emergency Resources
- `GET/POST http://localhost:8000/api/sos/resources/`

### Chatbot
- `POST http://localhost:8000/api/chatbot/message/`
- `GET http://localhost:8000/api/chatbot/faq/`

### Disaster Mapping
- `GET http://localhost:8000/api/mapping/zones/`
- `GET http://localhost:8000/api/mapping/heatmap/`

## 🎯 Test the System

1. **Register a user**: POST to `/api/auth/register/`
2. **Login**: POST to `/api/auth/login/`
3. **Create SOS report**: POST to `/api/sos/`
4. **View reports**: GET `/api/sos/`
5. **Chat with bot**: POST to `/api/chatbot/message/`

## 🚨 Troubleshooting

### If you get import errors:
```bash
# Make sure you're in the backend directory
cd backend
# Activate virtual environment
venv\Scripts\activate
# Install missing packages
pip install django djangorestframework django-cors-headers
```

### If you get database errors:
```bash
# Delete existing database
del db.sqlite3
# Run migrations again
python manage.py makemigrations
python manage.py migrate
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Server starts without errors
- ✅ Admin panel accessible at `http://localhost:8000/admin/`
- ✅ API endpoints respond at `http://localhost:8000/api/`
- ✅ Frontend can connect to backend

## 🎉 Next Steps

1. **Frontend Setup**: Run `npm install` and `npm run dev` in the project root
2. **Test Integration**: Verify frontend can communicate with backend
3. **Add Features**: Implement additional AI/ML features
4. **Deploy**: Prepare for production deployment

---

**Your NUDRRS backend is now ready for SIH 2025! 🏆**
