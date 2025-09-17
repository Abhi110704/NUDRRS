#!/usr/bin/env python3
"""
Email Configuration Test Script
This script helps test and configure email settings for NUDRRS
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nudrrs.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_smtp_connection():
    """Test SMTP connection"""
    print("🔧 Testing SMTP Connection...")
    print(f"Host: {settings.EMAIL_HOST}")
    print(f"Port: {settings.EMAIL_PORT}")
    print(f"TLS: {settings.EMAIL_USE_TLS}")
    print(f"User: {settings.EMAIL_HOST_USER}")
    print(f"Password: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
    
    try:
        # Test SMTP connection
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        server.quit()
        print("✅ SMTP connection successful!")
        return True
    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")
        return False

def test_django_email():
    """Test Django email sending"""
    print("\n📧 Testing Django Email Sending...")
    
    try:
        result = send_mail(
            subject='NUDRRS - Email Test',
            message='This is a test email from NUDRRS. If you receive this, email configuration is working!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Send to yourself
            fail_silently=False,
        )
        print("✅ Django email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Django email failed: {e}")
        return False

def send_test_otp():
    """Send a test OTP email"""
    print("\n🔐 Sending Test OTP Email...")
    
    try:
        from authentication.email_service import EmailService
        result = EmailService.send_otp_email(
            email=settings.EMAIL_HOST_USER,  # Send to yourself
            otp='123456',
            user_name='Test User'
        )
        if result:
            print("✅ Test OTP email sent successfully!")
            print("📱 Check your email inbox for the OTP email")
        else:
            print("❌ Test OTP email failed")
        return result
    except Exception as e:
        print(f"❌ Test OTP email failed: {e}")
        return False

def main():
    print("🚀 NUDRRS Email Configuration Test")
    print("=" * 50)
    
    # Test 1: SMTP Connection
    smtp_ok = test_smtp_connection()
    
    if smtp_ok:
        # Test 2: Django Email
        django_ok = test_django_email()
        
        if django_ok:
            # Test 3: OTP Email
            otp_ok = send_test_otp()
            
            if otp_ok:
                print("\n🎉 All email tests passed!")
                print("Your email configuration is working correctly.")
            else:
                print("\n⚠️  OTP email test failed, but basic email works.")
        else:
            print("\n❌ Django email test failed.")
    else:
        print("\n❌ SMTP connection failed. Please check your email configuration.")
        print("\n📋 Gmail Setup Instructions:")
        print("1. Go to your Google Account settings")
        print("2. Enable 2-Factor Authentication")
        print("3. Generate an App Password:")
        print("   - Go to Security → 2-Step Verification → App passwords")
        print("   - Select 'Mail' and generate a password")
        print("   - Use this 16-character password in your .env file")
        print("4. Update your .env file:")
        print(f"   EMAIL_HOST_USER={settings.EMAIL_HOST_USER}")
        print("   EMAIL_HOST_PASSWORD=your-16-character-app-password")

if __name__ == "__main__":
    main()
