from django.utils.deprecation import MiddlewareMixin
from .user_service import MongoDBUserService

class MongoDBAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to authenticate users using MongoDB tokens
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.user_service = MongoDBUserService()
        super().__init__(get_response)
    
    def process_request(self, request):
        """Process request and set user from MongoDB token"""
        # Get token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Token '):
            token = auth_header.replace('Token ', '')
            user = self.user_service.get_user_by_token(token)
            
            if user and user.is_active:
                # Set user on request
                request.user = user
                request._cached_user = user
            else:
                request.user = None
                request._cached_user = None
        else:
            request.user = None
            request._cached_user = None
        
        return None
    
    def process_response(self, request, response):
        """Process response"""
        return response
