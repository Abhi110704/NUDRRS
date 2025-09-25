import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-demo-key-for-development-only')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1', 
    '0.0.0.0', 
    '*',
    '.vercel.app',
    '.onrender.com',
    'nudrrs-backend.onrender.com',
    'nudrrs.vercel.app'
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'authentication',
    'sos_reports',
    'ai_services',
    'notifications',
    'resources',
    'analytics',
    'mongodb_integration',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nudrrs.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nudrrs.wsgi.application'
ASGI_APPLICATION = 'nudrrs.asgi.application'

# MongoDB as primary database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MongoDB Configuration
# For local MongoDB (development)
# MONGODB_SETTINGS = {
#     'host': 'mongodb://localhost:27017/',
#     'db': 'nudrrs_mongodb',
#     'port': 27017,
# }

# MongoDB Atlas Configuration (Primary Database)
MONGODB_SETTINGS = {
    'host': os.environ.get('MONGODB_CONNECTION_STRING', 'mongodb://localhost:27017/'),
    'db': os.environ.get('MONGODB_DATABASE_NAME', 'nudrrs_mongodb'),
    'port': 27017,
}

# Cache configuration for sessions
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Session configuration - use cache since we're using MongoDB
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'authentication.mongodb_auth.MongoDBTokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Allow public access for dashboard data
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# CORS and Security Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:19006",
    # Non-HTTP schemes should not be included in CSRF trusted origins
    "exp://localhost:19000",
    "https://nudrrs.vercel.app",
    "https://nudrrs.vercel.app:3000",
    "https://nudrrs.vercel.app:443",
    "https://nudrrs.vercel.app:80",
    # Render frontend domains
    "https://nudrrs-frontend.onrender.com",
    "https://nudrrs-1.onrender.com",
    # Render backend domains (allowing CORS for API explorer, etc.)
    "https://nudrrs.onrender.com",
    "https://nudrrs-frontend.onrender.com",
    "https://nudrrs-backend.onrender.com"
]

# Security settings
CORS_ALLOW_CREDENTIALS = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# CSRF trusted origins must be HTTP/HTTPS only (Django 4.0+ requirement)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:19006",
    "https://nudrrs.vercel.app",
    "https://nudrrs.vercel.app:3000",
    "https://nudrrs.vercel.app:443",
    "https://nudrrs.vercel.app:80",
    # Render frontend domains
    "https://nudrrs-frontend.onrender.com",
    "https://nudrrs-1.onrender.com",
    # Render backend primary domain if form posts from same site
    "https://nudrrs.onrender.com",
    "https://nudrrs-frontend.onrender.com",
    "https://nudrrs-backend.onrender.com",
]

# For development only - relax policies for local HTTP dev
if DEBUG:
    # Allow all origins in development (don't set wildcard list for CORS_ALLOWED_ORIGINS)
    CORS_ALLOW_ALL_ORIGINS = True
    # Trust local dev frontends explicitly for CSRF
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    # Cookies over HTTP should not be 'Secure' in local dev
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    # SameSite can be 'Lax' to allow basic cross-site GETs during dev
    SESSION_COOKIE_SAMESITE = 'Lax'

# For development, you can allow all origins. In production, specify allowed origins.
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Set to False in production

# Allow credentials
CORS_ALLOW_CREDENTIALS = True

# Allowed methods and headers
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Channel layers configuration (commented out for SQLite)
# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             "hosts": [('127.0.0.1', 6379)],
#         },
#     },
# }

# AI/ML Settings
AI_MODEL_PATH = BASE_DIR / 'ai_models'
YOLO_MODEL_PATH = AI_MODEL_PATH / 'yolov8n.pt'

# External API Keys
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')


# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')

# Email Configuration
EMAIL_BACKEND = 'authentication.email_backend.CustomSMTPEmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = False  # Use TLS, not SSL
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@nudrrs.com')

# Email timeout settings
EMAIL_TIMEOUT = 30

# SSL Context for email (fixes certificate issues on macOS)
import ssl
EMAIL_SSL_CONTEXT = ssl.create_default_context()
EMAIL_SSL_CONTEXT.check_hostname = False
EMAIL_SSL_CONTEXT.verify_mode = ssl.CERT_NONE

# Password Reset Settings
PASSWORD_RESET_TIMEOUT = 900  # 15 minutes in seconds
OTP_LENGTH = 6


# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
