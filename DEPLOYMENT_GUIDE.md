# NUDRRS Deployment Guide
## Complete Setup and Deployment Instructions

### 🚀 **Quick Start (Development)**

#### **Prerequisites**
- Python 3.11+
- Node.js 18+
- PostgreSQL with PostGIS extension
- Redis server
- Git

#### **1. Clone and Setup Backend**
```bash
# Clone repository
git clone <your-repo-url>
cd windsurf-project

# Setup Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### **2. Setup Frontend**
```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### **3. Access Application**
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

---

### 🐳 **Docker Deployment (Recommended)**

#### **1. Using Docker Compose**
```bash
# Clone repository
git clone <your-repo-url>
cd windsurf-project

# Build and start all services
docker-compose up --build

# Run migrations (first time only)
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

#### **2. Access Services**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

### ☁️ **Cloud Deployment**

#### **Option 1: Heroku Deployment**

1. **Prepare for Heroku**
```bash
# Install Heroku CLI
# Create Procfile
echo "web: gunicorn nudrrs.wsgi:application" > backend/Procfile

# Create runtime.txt
echo "python-3.11.0" > backend/runtime.txt
```

2. **Deploy Backend**
```bash
cd backend
heroku create nudrrs-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a nudrrs-backend
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

3. **Deploy Frontend (Netlify)**
```bash
cd frontend
npm run build

# Deploy to Netlify
# 1. Go to netlify.com
# 2. Drag and drop the 'build' folder
# 3. Update API URLs to point to Heroku backend
```

#### **Option 2: AWS Deployment**

1. **Backend on AWS EC2**
```bash
# Launch EC2 instance (Ubuntu 22.04)
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv postgresql postgresql-contrib redis-server nginx

# Clone and setup project
git clone <your-repo-url>
cd windsurf-project/backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure PostgreSQL
sudo -u postgres createdb nudrrs_db
sudo -u postgres createuser nudrrs_user

# Setup Nginx
sudo cp deployment/nginx.conf /etc/nginx/sites-available/nudrrs
sudo ln -s /etc/nginx/sites-available/nudrrs /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Setup systemd service
sudo cp deployment/nudrrs.service /etc/systemd/system/
sudo systemctl enable nudrrs
sudo systemctl start nudrrs
```

2. **Frontend on AWS S3 + CloudFront**
```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Setup CloudFront distribution
# Point to S3 bucket
# Configure custom domain (optional)
```

---

### 📱 **Mobile App Deployment**

#### **React Native Setup**
```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Create React Native project
npx react-native init NUDRRSMobile
cd NUDRRSMobile

# Install dependencies
npm install axios react-navigation @react-navigation/native @react-navigation/stack
npm install react-native-maps react-native-geolocation-service
npm install react-native-image-picker react-native-permissions

# iOS setup
cd ios && pod install && cd ..

# Android setup - update android/app/src/main/AndroidManifest.xml with permissions
```

#### **Build and Deploy**
```bash
# Android
cd android
./gradlew assembleRelease

# iOS (requires Mac)
cd ios
xcodebuild -workspace NUDRRSMobile.xcworkspace -scheme NUDRRSMobile -configuration Release

# Deploy to stores
# Google Play Store: Upload APK/AAB
# Apple App Store: Upload via Xcode or Application Loader
```

---

### 🔧 **Configuration Files**

#### **Backend Environment Variables**
```env
# Production .env file
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=nudrrs_production
DB_USER=nudrrs_user
DB_PASSWORD=secure-password
DB_HOST=your-db-host
DB_PORT=5432

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Redis
REDIS_URL=redis://your-redis-host:6379/0
```

#### **Frontend Environment Variables**
```env
# .env.production
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_GOOGLE_MAPS_KEY=your-google-maps-key
REACT_APP_WEBSOCKET_URL=wss://your-backend-domain.com/ws
```

---

### 🔒 **Security Configuration**

#### **SSL/HTTPS Setup**
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### **Firewall Configuration**
```bash
# Ubuntu UFW
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5432  # PostgreSQL (if external)
```

---

### 📊 **Monitoring and Logging**

#### **Application Monitoring**
```bash
# Install monitoring tools
pip install sentry-sdk django-extensions

# Add to settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
)
```

#### **Log Management**
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/nudrrs

# Add configuration:
/path/to/nudrrs/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
}
```

---

### 🧪 **Testing and Quality Assurance**

#### **Backend Testing**
```bash
cd backend

# Run tests
python manage.py test

# Coverage report
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

#### **Frontend Testing**
```bash
cd frontend

# Run tests
npm test

# E2E testing with Cypress
npm install --save-dev cypress
npx cypress open
```

---

### 🚨 **Emergency Procedures**

#### **Backup and Recovery**
```bash
# Database backup
pg_dump nudrrs_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql nudrrs_db < backup_file.sql

# Media files backup
rsync -av /path/to/media/ /backup/location/
```

#### **Rollback Procedures**
```bash
# Git rollback
git log --oneline
git reset --hard <commit-hash>

# Database migration rollback
python manage.py migrate app_name previous_migration_number

# Docker rollback
docker-compose down
docker-compose up --build
```

---

### 📞 **Support and Maintenance**

#### **Regular Maintenance Tasks**
- **Daily**: Monitor application logs and performance
- **Weekly**: Check database performance and optimize queries
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and update disaster response procedures

#### **Performance Optimization**
```bash
# Database optimization
python manage.py dbshell
VACUUM ANALYZE;

# Static file compression
python manage.py collectstatic --noinput
python manage.py compress

# Cache warming
python manage.py warm_cache
```

---

### 📋 **Deployment Checklist**

#### **Pre-Deployment**
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Static files collected
- [ ] SSL certificates configured
- [ ] Monitoring tools setup

#### **Post-Deployment**
- [ ] Application accessible
- [ ] Database connections working
- [ ] API endpoints responding
- [ ] Real-time features functional
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

#### **Go-Live Checklist**
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team training completed
- [ ] Emergency contacts updated
- [ ] Rollback plan prepared

---

### 🎯 **SIH Demo Deployment**

#### **Quick Demo Setup (15 minutes)**
```bash
# 1. Clone and start with Docker
git clone <repo-url> && cd windsurf-project
docker-compose up --build -d

# 2. Setup demo data
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py loaddata demo_data.json

# 3. Access demo
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin (admin/admin)
```

#### **Demo Features to Showcase**
1. **Real-time SOS reporting** via mobile interface
2. **AI verification** of emergency images
3. **Live dashboard** with map visualization
4. **Resource allocation** and tracking
5. **Multi-language support** demonstration
6. **Government integration** simulation

---

This deployment guide covers all scenarios from development to production, ensuring your NUDRRS system can be deployed successfully for the SIH demonstration and beyond.
