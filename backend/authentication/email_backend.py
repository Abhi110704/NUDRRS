"""
Custom email backend to handle SSL certificate issues
"""
import ssl
import smtplib
from django.core.mail.backends.smtp import EmailBackend as SMTPEmailBackend
from django.conf import settings

class CustomSMTPEmailBackend(SMTPEmailBackend):
    """Custom SMTP backend that handles SSL certificate issues"""
    
    def open(self):
        """Override to use custom SSL context"""
        if self.connection:
            return False
        
        try:
            # Create SSL context that doesn't verify certificates
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # Create SMTP connection with custom SSL context
            self.connection = smtplib.SMTP(self.host, self.port)
            
            if self.use_tls:
                self.connection.starttls(context=ssl_context)
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except Exception as e:
            if not self.fail_silently:
                raise e
            return False
