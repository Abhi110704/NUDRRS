import requests
from django.conf import settings
from django.utils import timezone
from .models import Notification

class NotificationService:
    def __init__(self):
        self.twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
        self.twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
    
    def send_notification(self, recipient, message, notification_type='SMS', report_id=None):
        """Send notification via specified channel"""
        
        # Create notification record
        notification = Notification.objects.create(
            recipient=recipient,
            message=message,
            notification_type=notification_type,
            report_id=report_id
        )
        
        try:
            if notification_type == 'SMS':
                result = self.send_sms(recipient, message)
            elif notification_type == 'EMAIL':
                result = self.send_email(recipient, message)
            elif notification_type == 'WHATSAPP':
                result = self.send_whatsapp(recipient, message)
            else:
                result = {'success': False, 'error': 'Unsupported notification type'}
            
            if result.get('success'):
                notification.status = 'SENT'
                notification.sent_at = timezone.now()
            else:
                notification.status = 'FAILED'
            
            notification.save()
            return result
            
        except Exception as e:
            notification.status = 'FAILED'
            notification.save()
            return {'success': False, 'error': str(e)}
    
    def send_sms(self, phone_number, message):
        """Send SMS using Twilio (mock implementation for demo)"""
        if not self.twilio_sid or not self.twilio_token:
            # Mock successful SMS for demo
            return {
                'success': True,
                'message': 'SMS sent successfully (demo mode)',
                'sid': 'mock_sms_id'
            }
        
        # Real Twilio implementation would go here
        try:
            # from twilio.rest import Client
            # client = Client(self.twilio_sid, self.twilio_token)
            # message = client.messages.create(
            #     body=message,
            #     from_='+1234567890',  # Your Twilio number
            #     to=phone_number
            # )
            # return {'success': True, 'sid': message.sid}
            
            return {
                'success': True,
                'message': 'SMS sent successfully',
                'sid': 'mock_sms_id'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_email(self, email, message):
        """Send email notification"""
        # Mock implementation for demo
        return {
            'success': True,
            'message': 'Email sent successfully (demo mode)',
            'email_id': 'mock_email_id'
        }
    
    def send_whatsapp(self, phone_number, message):
        """Send WhatsApp message"""
        # Mock implementation for demo
        return {
            'success': True,
            'message': 'WhatsApp message sent successfully (demo mode)',
            'whatsapp_id': 'mock_whatsapp_id'
        }
    
    def send_emergency_alert(self, report):
        """Send emergency alerts to relevant authorities"""
        emergency_contacts = [
            '+911234567890',  # NDRF
            '+911234567891',  # Local Police
            '+911234567892',  # Fire Department
        ]
        
        message = f"""
EMERGENCY ALERT - NUDRRS

Type: {report.disaster_type}
Priority: {report.priority}
Location: {report.address}
Description: {report.description}
Contact: {report.phone_number}
Time: {report.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Report ID: {report.id}
        """.strip()
        
        results = []
        for contact in emergency_contacts:
            result = self.send_notification(
                recipient=contact,
                message=message,
                notification_type='SMS',
                report_id=report.id
            )
            results.append(result)
        
        return results
