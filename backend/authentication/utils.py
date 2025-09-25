"""
Utility functions for authentication app
"""
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

def get_tokens_for_user(user_id, email):
    """
    Generate JWT tokens for the given user
    
    Args:
        user_id: The user's ID
        email: The user's email
        
    Returns:
        dict: Access and refresh tokens
    """
    from rest_framework_simplejwt.tokens import RefreshToken
    
    refresh = RefreshToken.for_user({'id': user_id, 'email': email})
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def send_password_reset_email(email, otp):
    """
    Send a password reset email with OTP to the user
    
    Args:
        email (str): User's email address
        otp (str): The OTP to include in the email
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        subject = 'Password Reset Request'
        
        # Create email content
        context = {
            'otp': otp,
            'expiry_minutes': 10,  # OTP expiry time in minutes
            'support_email': settings.DEFAULT_FROM_EMAIL,
        }
        
        # Render HTML email
        html_message = render_to_string('emails/password_reset.html', context)
        plain_message = f"""
        Your password reset OTP is: {otp}
        
        This OTP is valid for 10 minutes.
        
        If you didn't request this, please ignore this email.
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=strip_tags(plain_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {str(e)}")
        return False
