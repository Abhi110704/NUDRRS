# NUDRRS Emergency Management System - Setup Instructions

## Overview
This is a comprehensive emergency management system with:
- **Frontend**: React-based emergency reporting interface with live maps and analytics
- **Backend**: Django REST API with AI-powered emergency verification
- **Admin Panel**: Enhanced Django admin with emergency dashboard

## Features Implemented

### ✅ 1. Compact Emergency Report Forms
- Clean, simple design without large headers
- Compact dialogs for creating, viewing, and editing reports
- Streamlined user experience

### ✅ 2. Live Data Integration
- Removed demo/live toggle - now shows all data by default
- Admin-only delete functionality
- Real-time data fetching from backend

### ✅ 3. Live Maps Integration
- Interactive map showing all emergency reports
- Real-time updates every 30 seconds
- Command control panel with filtering options
- Critical alert highlighting

### ✅ 4. Analytics Integration
- Real-time analytics dashboard
- Integration with report data
- Performance metrics and trends

### ✅ 5. Enhanced Django Admin Panel
- Custom emergency dashboard
- Visual report management with badges and progress bars
- Bulk actions for report management
- Advanced filtering and search

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server:**
   ```bash
   python run_server.py
   ```
   
   This will:
   - Run database migrations
   - Create admin user (username: `admin`, password: `admin123`)
   - Start the server on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   This will start the React app on `http://localhost:3000`

## Access Points

### 🌐 Frontend Application
- **URL**: http://localhost:3000
- **Features**: Emergency reporting, live maps, analytics dashboard

### 🔧 Django Admin Panel
- **URL**: http://localhost:8000/admin/
- **Username**: `admin`
- **Password**: `admin123`
- **Emergency Dashboard**: http://localhost:8000/admin/emergency-dashboard/

### 📡 API Endpoints
- **Base URL**: http://localhost:8000/api/
- **Reports**: http://localhost:8000/api/sos_reports/
- **Analytics**: http://localhost:8000/api/sos_reports/dashboard_stats/

## Key Features

### Emergency Reports
- **Create**: Compact form for new emergency reports
- **View**: Clean, detailed view of report information
- **Edit**: Streamlined editing interface
- **Delete**: Admin-only delete functionality
- **Live Updates**: Real-time data synchronization

### Live Maps
- **Interactive Map**: Shows all emergency reports with custom markers
- **Filtering**: Filter by priority, status, and disaster type
- **Real-time Updates**: Auto-refresh every 30 seconds
- **Critical Alerts**: Special highlighting for critical emergencies

### Analytics Dashboard
- **Real-time Metrics**: Live statistics and performance indicators
- **Trend Analysis**: Time-series data and patterns
- **Disaster Distribution**: Breakdown by type and priority
- **Response Metrics**: Performance and accuracy statistics

### Admin Panel
- **Emergency Dashboard**: Comprehensive overview of all emergencies
- **Visual Management**: Color-coded badges and progress indicators
- **Bulk Actions**: Mass operations on reports
- **Advanced Search**: Filter by multiple criteria
- **AI Integration**: AI confidence scores and verification status

## API Usage

### Create Emergency Report
```bash
curl -X POST http://localhost:8000/api/sos_reports/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "New Delhi, India",
    "disaster_type": "FLOOD",
    "description": "Severe flooding in residential area",
    "priority": "HIGH"
  }'
```

### Get All Reports
```bash
curl http://localhost:8000/api/sos_reports/
```

### Get Dashboard Statistics
```bash
curl http://localhost:8000/api/sos_reports/dashboard_stats/
```

## Database

The system uses SQLite for development (automatically created) and can be configured for PostgreSQL in production.

### Models
- **SOSReport**: Main emergency report model
- **ReportMedia**: Media attachments for reports
- **ReportUpdate**: Status update history

## Troubleshooting

### Backend Issues
1. **Port 8000 in use**: Change port in `run_server.py`
2. **Database errors**: Delete `db.sqlite3` and run migrations again
3. **Admin access**: Use username `admin` and password `admin123`

### Frontend Issues
1. **Port 3000 in use**: React will prompt to use a different port
2. **API connection**: Ensure backend is running on port 8000
3. **CORS errors**: Backend includes CORS headers for development

### Common Commands
```bash
# Backend
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd frontend
npm install
npm start
```

## Development Notes

- The system automatically falls back to demo data if the backend is unavailable
- All forms are designed to be compact and user-friendly
- The admin panel includes custom styling and enhanced functionality
- Real-time updates are implemented with automatic refresh intervals
- AI integration is prepared for future enhancement

## Production Deployment

For production deployment:
1. Configure PostgreSQL database
2. Set up proper environment variables
3. Use a production WSGI server (Gunicorn)
4. Configure static file serving
5. Set up proper CORS policies
6. Enable HTTPS

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all services are running on correct ports
3. Ensure database migrations are up to date
4. Check network connectivity between frontend and backend
