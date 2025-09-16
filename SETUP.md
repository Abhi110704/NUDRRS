# NUDRRS - Emergency Reporting System Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB Atlas account
- Cloudinary account (for image storage)

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Fill in your actual credentials:
     ```bash
     cp env.example .env
     ```

5. **Required Environment Variables:**
   ```env
   SECRET_KEY=your-django-secret-key
   MONGODB_CONNECTION_STRING=your-mongodb-atlas-connection-string
   MONGODB_DATABASE_NAME=your-database-name
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   GEMINI_API_KEY=your-gemini-api-key
   ```

6. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

7. **Start the server:**
   ```bash
   python manage.py runserver
   ```

## Frontend Setup

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

## Features

- **Emergency Report Creation**: Users can create emergency reports with images
- **Real-time Updates**: Live dashboard with real-time data
- **AI Verification**: AI-powered report verification using Gemini
- **Image Storage**: Cloudinary integration for image uploads
- **Comment System**: Users can comment on reports
- **Admin Panel**: Administrative interface for report management
- **Analytics**: Comprehensive analytics and reporting
- **MongoDB Integration**: Scalable database solution

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive credentials
- The `.gitignore` file is configured to exclude sensitive files
- MongoDB connection strings should be stored securely

## API Endpoints

- `GET /api/sos_reports/` - List all reports
- `POST /api/sos_reports/` - Create new report
- `GET /api/sos_reports/{id}/` - Get specific report
- `POST /api/sos_reports/{id}/updates/` - Add comment to report
- `GET /api/auth/profile/` - Get user profile

## Deployment

For production deployment:
1. Set `DEBUG=False` in environment variables
2. Use a production database
3. Configure proper CORS settings
4. Set up SSL certificates
5. Use a production WSGI server like Gunicorn
