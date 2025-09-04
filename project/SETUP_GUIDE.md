# 🚨 NUDRRS - National Unified Disaster Response & Relief System
## Complete Setup Guide for SIH 2025

### 🏆 Project Overview
**Team:** HackerXHacker  
**Members:** Abhiyanshu Anand, Sanskar Singh, Krati Bajpai, Himani Garg, Shabin S  
**Theme:** Disaster Management & Emergency Response

---

## 📋 Prerequisites

### System Requirements
- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Development Tools
- **VS Code** or any preferred IDE
- **Postman** for API testing
- **Git** for version control

---

## 🚀 Quick Start Commands

### 1. Backend Setup (Django + SQLite)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy env_example.txt .env
# Edit .env file with your actual values

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### 2. Frontend Setup (React + TypeScript)

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔧 Configuration

### Backend Configuration (.env file)

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database (SQLite for development)
# DATABASE_URL=sqlite:///db.sqlite3

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
IMD_WEATHER_API_KEY=your-imd-weather-api-key
ISRO_BHUVAN_API_KEY=your-isro-bhuvan-api-key

# AI/ML Services
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

### Frontend Configuration

The frontend is configured to connect to the Django backend at `http://localhost:8000/api`. No additional configuration needed for development.

---

## 📊 Database Schema

### Key Models

1. **User Model** - Custom user with role-based access
2. **SOSReport Model** - Emergency reports with AI verification
3. **DisasterZone Model** - Disaster areas and affected regions
4. **EmergencyResource Model** - Available emergency resources
5. **ChatSession Model** - AI chatbot interactions

### Sample Data Creation

```python
# Run in Django shell: python manage.py shell

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

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET/PUT /api/auth/profile/` - User profile

### SOS Reports
- `GET/POST /api/sos/` - List/Create SOS reports
- `GET/PUT/DELETE /api/sos/{id}/` - SOS report detail
- `POST /api/sos/{id}/assign/` - Assign report to responder
- `POST /api/sos/{id}/status/` - Update report status
- `GET /api/sos/nearby/` - Get nearby reports

### Emergency Resources
- `GET/POST /api/sos/resources/` - List/Create emergency resources
- `GET/PUT/DELETE /api/sos/resources/{id}/` - Resource detail

---

## 🎯 Key Features Implemented

### ✅ Core Features
1. **User Authentication & Authorization** - Role-based access control
2. **SOS Reporting System** - Emergency report submission with GPS
3. **Real-time Dashboard** - Live updates and statistics
4. **Interactive Mapping** - Disaster zones and resource locations
5. **AI-Powered Chatbot** - Multilingual emergency assistance
6. **Resource Management** - Emergency resource allocation
7. **Admin Panel** - Comprehensive system administration

### 🔄 In Progress
1. **AI Report Classification** - ML-powered report verification
2. **Real-time Notifications** - SMS/Email alerts
3. **Advanced Analytics** - Predictive disaster modeling
4. **Mobile App** - React Native implementation

---

## 🧪 Testing

### Backend Testing
```bash
# Run Django tests
python manage.py test

# Test specific app
python manage.py test apps.sos_reports
```

### Frontend Testing
```bash
# Run frontend tests
npm test

# Run linting
npm run lint
```

### API Testing with Postman
1. Import the API collection (create from endpoints above)
2. Set base URL to `http://localhost:8000/api`
3. Test authentication flow
4. Test SOS report creation
5. Test resource management

---

## 🚀 Deployment

### Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- Admin Panel: `http://localhost:8000/admin`

### Production (Future)
- **Backend:** Deploy to Heroku/AWS with PostgreSQL
- **Frontend:** Deploy to Vercel/Netlify
- **Database:** PostgreSQL with PostGIS for geospatial data
- **CDN:** CloudFlare for static assets

---

## 📱 Mobile App (Future)

### React Native Setup
```bash
# Install React Native CLI
npm install -g react-native-cli

# Create mobile app
npx react-native init NUDRRSMobile

# Install dependencies
cd NUDRRSMobile
npm install axios react-native-maps react-native-geolocation-service
```

---

## 🤖 AI/ML Integration

### Current AI Features
1. **Report Classification** - Categorize emergency types
2. **Image Verification** - Verify uploaded images
3. **Chatbot NLP** - Natural language processing
4. **Predictive Analytics** - Disaster risk assessment

### AI Models Used
- **YOLOv8** - Image classification and verification
- **LSTM** - Time series prediction for disasters
- **Transformers** - Natural language processing
- **Scikit-learn** - Traditional ML algorithms

---

## 🔒 Security Features

### Implemented
- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Granular permissions
- **Input Validation** - XSS and injection protection
- **CORS Configuration** - Cross-origin request security
- **File Upload Security** - Secure media handling

### Future Enhancements
- **End-to-End Encryption** - Sensitive data protection
- **Rate Limiting** - API abuse prevention
- **Audit Logging** - Comprehensive activity tracking
- **Multi-factor Authentication** - Enhanced security

---

## 📊 Analytics & Monitoring

### Dashboard Metrics
- **Total Reports** - Emergency reports count
- **Response Time** - Average response time
- **Resource Utilization** - Resource usage statistics
- **Geographic Distribution** - Reports by location
- **Category Breakdown** - Emergency types analysis

### Real-time Updates
- **WebSocket Integration** - Live data updates
- **Push Notifications** - Instant alerts
- **Email Notifications** - Status updates
- **SMS Alerts** - Critical notifications

---

## 🌍 Multilingual Support

### Supported Languages
- **English** (en) - Primary language
- **Hindi** (hi) - National language
- **Regional Languages** - Tamil, Telugu, Bengali, etc.

### Implementation
- **i18n Framework** - Internationalization
- **Dynamic Language Switching** - Runtime language change
- **Voice Support** - Text-to-speech in local languages
- **WhatsApp Integration** - Regional language support

---

## 🎯 SIH 2025 Presentation Points

### Problem Statement
- **Scattered Information** - Multiple platforms, no unified system
- **Delayed Response** - Lack of real-time coordination
- **Resource Misallocation** - Inefficient emergency response
- **Language Barriers** - Limited accessibility

### Solution Highlights
- **Unified Platform** - Single source of truth
- **AI-Powered** - Smart classification and prediction
- **Real-time Coordination** - Instant communication
- **Scalable Architecture** - Pan-India deployment ready

### Technical Innovation
- **Machine Learning** - Predictive disaster modeling
- **IoT Integration** - Sensor data integration
- **Cloud Architecture** - Scalable and reliable
- **Mobile-First** - Accessible on any device

### Social Impact
- **Lives Saved** - Faster emergency response
- **Cost Reduction** - Efficient resource utilization
- **Accessibility** - Multilingual support
- **Preparedness** - Better disaster readiness

---

## 📞 Support & Contact

### Team Contacts
- **Abhiyanshu Anand** - Team Lead & Full Stack Developer
- **Sanskar Singh** - Backend Developer & Database Architect
- **Himani Garg** - Frontend Developer & UI/UX Designer
- **Krati Bajpai** - AI/ML Engineer & Data Analyst
- **Shabin S** - DevOps Engineer & System Integration

### Project Repository
- **GitHub:** [Repository URL]
- **Documentation:** [Documentation URL]
- **Demo:** [Live Demo URL]

---

## 🏆 Why This Will Win SIH 2025

1. **Direct Government Alignment** - Addresses critical national priority
2. **High Social Impact** - Directly saves lives and reduces disaster impact
3. **Technical Innovation** - Cutting-edge AI/ML integration
4. **Scalability** - Designed for pan-India deployment
5. **Feasible Implementation** - Working prototype in 36 hours
6. **Real-World Validation** - Addresses actual pain points

---

**Built with ❤️ by Team HackerXHacker for a safer India** 🇮🇳
