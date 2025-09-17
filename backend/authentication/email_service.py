"""
Email service for sending OTP and password reset emails
"""
import random
import string
import ssl
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

# Create unverified SSL context for development
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

class EmailService:
    """Service class for sending emails"""
    
    @staticmethod
    def generate_otp(length=6):
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def send_otp_email(email, otp, user_name=None):
        """Send OTP email for password reset"""
        try:
            subject = 'NUDRRS - Password Reset OTP'
            
            # Create HTML email content
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset OTP</title>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }}
                    .container {{
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 30px;
                    }}
                    .logo {{
                        font-size: 28px;
                        font-weight: bold;
                        color: #1e3a8a;
                        margin-bottom: 10px;
                    }}
                    .otp-box {{
                        background-color: #f8fafc;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }}
                    .otp-code {{
                        font-size: 32px;
                        font-weight: bold;
                        color: #1e3a8a;
                        letter-spacing: 5px;
                        font-family: 'Courier New', monospace;
                    }}
                    .warning {{
                        background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e2e8f0;
                        color: #6b7280;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">NUDRRS</div>
                        <h2>Password Reset Request</h2>
                    </div>
                    
                    <p>Hello {user_name or 'User'},</p>
                    
                    <p>We received a request to reset your password for your NUDRRS account. Use the OTP below to proceed with resetting your password:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">{otp}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>Important:</strong>
                        <ul>
                            <li>This OTP is valid for 15 minutes only</li>
                            <li>Do not share this OTP with anyone</li>
                            <li>If you didn't request this password reset, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions or need assistance, please contact our support team.</p>
                    
                    <div class="footer">
                        <p>This is an automated message from NUDRRS. Please do not reply to this email.</p>
                        <p>&copy; 2024 NUDRRS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            plain_message = f"""
            NUDRRS - Password Reset OTP
            
            Hello {user_name or 'User'},
            
            We received a request to reset your password for your NUDRRS account.
            
            Your OTP is: {otp}
            
            This OTP is valid for 15 minutes only.
            Do not share this OTP with anyone.
            
            If you didn't request this password reset, please ignore this email.
            
            Best regards,
            NUDRRS Team
            """
            
            # Send email
            try:
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False,
                )
                logger.info(f"OTP email sent successfully to {email}")
                return True
            except Exception as email_error:
                logger.error(f"SMTP error: {str(email_error)}")
                
                # Try alternative approach for development
                if settings.DEBUG:
                    try:
                        # Use console backend for development
                        from django.core.mail import get_connection
                        from django.core.mail.message import EmailMultiAlternatives
                        
                        connection = get_connection('django.core.mail.backends.console.EmailBackend')
                        msg = EmailMultiAlternatives(
                            subject=subject,
                            body=plain_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            to=[email],
                            connection=connection
                        )
                        msg.attach_alternative(html_message, "text/html")
                        msg.send()
                        
                        logger.warning(f"Development mode: Email sent to console. Check Django console for OTP: {otp}")
                        return True
                    except Exception as console_error:
                        logger.error(f"Console email also failed: {str(console_error)}")
                        logger.warning(f"Development mode: Email sending failed. OTP for {email}: {otp}")
                        return True
                else:
                    # In production, raise the error
                    raise email_error
            
        except Exception as e:
            logger.error(f"Failed to send OTP email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset_success_email(email, user_name=None):
        """Send confirmation email after successful password reset"""
        try:
            subject = 'NUDRRS - Password Reset Successful'
            
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Successful</title>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }}
                    .container {{
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 30px;
                    }}
                    .logo {{
                        font-size: 28px;
                        font-weight: bold;
                        color: #1e3a8a;
                        margin-bottom: 10px;
                    }}
                    .success-box {{
                        background-color: #f0fdf4;
                        border: 2px solid #22c55e;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }}
                    .success-icon {{
                        font-size: 48px;
                        color: #22c55e;
                        margin-bottom: 10px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e2e8f0;
                        color: #6b7280;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">NUDRRS</div>
                        <h2>Password Reset Successful</h2>
                    </div>
                    
                    <p>Hello {user_name or 'User'},</p>
                    
                    <div class="success-box">
                        <div class="success-icon">✓</div>
                        <h3>Your password has been successfully reset!</h3>
                    </div>
                    
                    <p>Your NUDRRS account password has been updated successfully. You can now log in with your new password.</p>
                    
                    <p>If you did not make this change, please contact our support team immediately.</p>
                    
                    <div class="footer">
                        <p>This is an automated message from NUDRRS. Please do not reply to this email.</p>
                        <p>&copy; 2024 NUDRRS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            plain_message = f"""
            NUDRRS - Password Reset Successful
            
            Hello {user_name or 'User'},
            
            Your password has been successfully reset!
            
            Your NUDRRS account password has been updated successfully. You can now log in with your new password.
            
            If you did not make this change, please contact our support team immediately.
            
            Best regards,
            NUDRRS Team
            """
            
            try:
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False,
                )
                logger.info(f"Password reset success email sent to {email}")
                return True
            except Exception as email_error:
                logger.error(f"SMTP error: {str(email_error)}")
                
                # Try alternative approach for development
                if settings.DEBUG:
                    try:
                        # Use console backend for development
                        from django.core.mail import get_connection
                        from django.core.mail.message import EmailMultiAlternatives
                        
                        connection = get_connection('django.core.mail.backends.console.EmailBackend')
                        msg = EmailMultiAlternatives(
                            subject=subject,
                            body=plain_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            to=[email],
                            connection=connection
                        )
                        msg.attach_alternative(html_message, "text/html")
                        msg.send()
                        
                        logger.warning(f"Development mode: Success email sent to console")
                        return True
                    except Exception as console_error:
                        logger.error(f"Console email also failed: {str(console_error)}")
                        logger.warning(f"Development mode: Success email sending failed")
                        return True
                else:
                    # In production, raise the error
                    raise email_error
            
        except Exception as e:
            logger.error(f"Failed to send password reset success email to {email}: {str(e)}")
            return False
