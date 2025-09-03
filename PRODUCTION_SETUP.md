# NUDRRS Production Setup Guide

## 🚀 Converting from Demo to Production

This guide explains how to configure NUDRRS for real-world disaster response without demo data.

## 1. Backend Configuration for Production

### Remove Demo Data
```bash
# Don't run the demo data script in production
# python populate_demo_data.py  # <-- Skip this
```

### Database Setup
```bash
cd backend

# Use PostgreSQL for production (recommended)
pip install psycopg2-binary

# Update settings.py for production database
# Replace SQLite with PostgreSQL configuration
```

### Environment Variables
Create `.env` file in backend directory:
```env
# Production Database
DATABASE_URL=postgresql://username:password@localhost:5432/nudrrs_prod
SECRET_KEY=your-super-secret-production-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,127.0.0.1

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
IMD_WEATHER_API_KEY=your-imd-weather-key
ISRO_BHUVAN_API_KEY=your-isro-api-key

# SMS/Email Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
EMAIL_HOST_USER=your-smtp-email
EMAIL_HOST_PASSWORD=your-smtp-password
```

### Production Settings
Update `backend/nudrrs/settings.py`:
```python
import os
from pathlib import Path

# Production database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'nudrrs_prod'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Security settings
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', '127.0.0.1']
SECRET_KEY = os.getenv('SECRET_KEY')

# CORS for production
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "http://localhost:3000",  # Remove in production
]
```

## 2. Frontend Configuration for Production

### Environment Variables
Create `.env` file in frontend directory:
```env
# Production API endpoints
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
REACT_APP_ENVIRONMENT=production
```

### Remove Demo Data Fallbacks
Update components to use real API data only:

**Dashboard.js:**
```javascript
const fetchDashboardData = async () => {
  try {
    // Only use real API - no demo fallback
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/sos-reports/dashboard_stats/`);
    setStats(response.data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Show error message instead of demo data
    setError('Unable to load dashboard data. Please check your connection.');
  }
};
```

**Analytics.js:**
```javascript
const fetchAnalyticsData = async () => {
  try {
    // Only use real API - no demo fallback
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/analytics/`);
    setStats(response.data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    setError('Analytics data unavailable');
  }
};
```

**Reports.js:**
```javascript
const fetchReports = async () => {
  try {
    // Only use real API - no demo fallback
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/sos-reports/`);
    setReports(response.data.results || response.data);
  } catch (error) {
    console.error('Error fetching reports:', error);
    setError('Unable to load reports');
  }
};
```

## 3. Real Data Integration

### User Registration System
Enable real user registration instead of demo users:
```python
# In Django views.py
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    phone = request.data.get('phone')
    
    # Create real user account
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    # Create user profile with phone
    UserProfile.objects.create(
        user=user,
        phone_number=phone
    )
    
    return Response({'message': 'User registered successfully'})
```

### Real SOS Report Submission
```python
@api_view(['POST'])
def submit_sos_report(request):
    # Validate user authentication
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    # Create real SOS report
    report = SOSReport.objects.create(
        user=request.user,
        disaster_type=request.data.get('disaster_type'),
        description=request.data.get('description'),
        latitude=request.data.get('latitude'),
        longitude=request.data.get('longitude'),
        address=request.data.get('address'),
        phone_number=request.data.get('phone_number'),
        priority='MEDIUM',  # Will be updated by AI
        status='PENDING'
    )
    
    # Trigger AI analysis
    analyze_report_with_ai.delay(report.id)
    
    # Send notifications to authorities
    notify_authorities.delay(report.id)
    
    return Response({'message': 'SOS report submitted', 'report_id': report.id})
```

## 4. External API Integration

### Google Maps Integration
```javascript
// In React components
const GoogleMapComponent = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  return (
    <GoogleMap
      apiKey={apiKey}
      center={{ lat: 28.6139, lng: 77.2090 }} // Delhi
      zoom={10}
      onMapClick={handleMapClick}
    >
      {reports.map(report => (
        <Marker
          key={report.id}
          position={{ lat: report.latitude, lng: report.longitude }}
          onClick={() => showReportDetails(report)}
        />
      ))}
    </GoogleMap>
  );
};
```

### Weather API Integration
```python
import requests
from django.conf import settings

def get_weather_alerts(latitude, longitude):
    """Fetch real weather alerts from IMD API"""
    url = f"https://api.imd.gov.in/weather/alerts"
    params = {
        'lat': latitude,
        'lon': longitude,
        'key': settings.IMD_API_KEY
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return None
```

## 5. Production Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install gunicorn whitenoise

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn nudrrs.wsgi:application --bind 0.0.0.0:8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Netlify/Vercel/AWS S3
# Upload build/ folder to your hosting service
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile for backend
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "nudrrs.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## 6. Security Considerations

### Authentication & Authorization
```python
# Use JWT tokens for API authentication
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Role-based permissions
class IsAuthorityUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Emergency_Authority').exists()
```

### Data Validation
```python
from django.core.validators import RegexValidator

class SOSReport(models.Model):
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$')]
    )
    # Add more validation as needed
```

## 7. Monitoring & Logging

### Production Logging
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/nudrrs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## 8. Quick Production Checklist

- [ ] Remove demo data script execution
- [ ] Configure PostgreSQL database
- [ ] Set up environment variables
- [ ] Update CORS and ALLOWED_HOSTS
- [ ] Remove demo data fallbacks from frontend
- [ ] Configure real API endpoints
- [ ] Set up user authentication system
- [ ] Integrate external APIs (Google Maps, Weather)
- [ ] Configure SMS/Email notifications
- [ ] Set up proper logging
- [ ] Deploy to production servers
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerts

## 🚨 Important Notes

1. **Never use demo data in production**
2. **Always validate user inputs**
3. **Implement proper authentication**
4. **Use HTTPS in production**
5. **Set up proper backup systems**
6. **Monitor system performance**
7. **Have disaster recovery plans**

Your NUDRRS system will now work with real emergency data and integrate with actual government systems and APIs for genuine disaster response operations.
