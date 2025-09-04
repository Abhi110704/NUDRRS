# 🚀 NUDRRS Backend Installation Guide

## ✅ Quick Installation (No Pillow Issues)

The requirements.txt has been updated to remove Pillow temporarily. Run these commands:

```bash
# 1. Install dependencies (Pillow-free version)
pip install -r requirements.txt

# 2. Create environment file
copy env_file.txt .env

# 3. Run the setup script
python setup.py

# 4. Start the server
python manage.py runserver
```

## 🔧 Alternative Manual Setup

If the setup script doesn't work, run these commands manually:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create environment file
copy env_file.txt .env

# 3. Create migrations
python manage.py makemigrations

# 4. Run migrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Start server
python manage.py runserver
```

## 📊 Sample Data

The setup script will create:
- **Admin User**: admin@nudrrs.gov.in / admin123
- **Responder User**: responder@nudrrs.gov.in / responder123  
- **Citizen User**: citizen@example.com / citizen123
- **Sample Emergency Resource**: Ambulance Unit 1
- **Sample FAQ**: Flood safety information
- **Sample Emergency Contact**: Delhi Police Emergency

## 🌐 Test the API

Once the server is running, test these endpoints:

```bash
# Test API health
curl http://localhost:8000/api/auth/

# Test SOS reports
curl http://localhost:8000/api/sos/

# Test chatbot
curl http://localhost:8000/api/chatbot/faq/
```

## 🎯 Frontend Integration

After backend is running:

```bash
# Navigate to project root
cd ..

# Install frontend dependencies
npm install

# Start frontend
npm run dev
```

## 🚨 Troubleshooting

### If you get import errors:
```bash
# Make sure you're in the backend directory
cd backend
# Activate virtual environment
venv\Scripts\activate
# Install missing packages
pip install django djangorestframework django-cors-headers django-filter
```

### If you get database errors:
```bash
# Delete existing database
del db.sqlite3
# Run migrations again
python manage.py makemigrations
python manage.py migrate
```

### If you get permission errors:
```bash
# Run as administrator or check file permissions
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Server starts without errors
- ✅ Admin panel accessible at `http://localhost:8000/admin/`
- ✅ API endpoints respond at `http://localhost:8000/api/`
- ✅ Frontend can connect to backend

## 🎉 Next Steps

1. **Test the backend** with the sample data
2. **Start the frontend** and verify integration
3. **Add Pillow later** for image handling if needed
4. **Prepare for SIH 2025** presentation

---

**Your NUDRRS backend is ready! 🏆**
