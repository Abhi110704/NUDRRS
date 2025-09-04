# 🚀 NUDRRS Frontend Setup Guide

## ✅ Backend Status
- **Django Server**: Running at http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **API Endpoints**: http://localhost:8000/api/

## 🔧 Frontend Setup Commands

```bash
# Navigate to project root (if not already there)
cd E:\Internship\NUDRRS\project

# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

## 🎯 Demo Credentials

### Admin Panel
- **URL**: http://localhost:8000/admin/
- **Username**: admin
- **Password**: admin123

### API Testing
- **Base URL**: http://localhost:8000/api/
- **Authentication**: http://localhost:8000/api/auth/

### Sample Users Created
- **Admin**: admin@nudrrs.gov.in / admin123
- **Responder**: responder@nudrrs.gov.in / responder123
- **Citizen**: citizen@example.com / citizen123

## 🌐 Available Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - User profile

### SOS Reports
- `GET/POST /api/sos/` - List/Create SOS reports
- `GET /api/sos/nearby/` - Get nearby reports

### Chatbot
- `POST /api/chatbot/message/` - Send message to chatbot
- `GET /api/chatbot/faq/` - Get emergency FAQs

## 🧪 Test the System

1. **Start Frontend**: `npm run dev`
2. **Visit**: http://localhost:5173
3. **Test Registration**: Create a new user account
4. **Test SOS Report**: Submit an emergency report
5. **Test Chatbot**: Ask emergency questions

## 🎉 Success Indicators

- ✅ Backend running on port 8000
- ✅ Frontend running on port 5173
- ✅ Admin panel accessible
- ✅ API endpoints responding
- ✅ Frontend-backend integration working

## 🏆 SIH 2025 Ready!

Your NUDRRS system is now fully functional and ready for demonstration at Smart India Hackathon 2025!

**Features Working:**
- User authentication and registration
- SOS emergency reporting with GPS
- AI-powered chatbot for emergency assistance
- Admin panel for system management
- Real-time API communication

**Good luck with your presentation! 🚨🇮🇳**
