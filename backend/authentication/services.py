"""
Service instances for the authentication app.
This file is used to avoid circular imports by centralizing service instances.
"""
import logging
from functools import wraps

# Set up logging
logger = logging.getLogger(__name__)

class ServiceInitializationError(Exception):
    """Custom exception for service initialization errors"""
    pass

# Global service instance
_auth_mongodb_service = None

def get_mongodb_service():
    """Get the MongoDB service instance with lazy initialization"""
    global _auth_mongodb_service
    
    if _auth_mongodb_service is None:
        try:
            from .mongodb_service import AuthMongoDBService
            _auth_mongodb_service = AuthMongoDBService(connect_on_init=False)
            _auth_mongodb_service.connect(max_retries=3, initial_delay=2)
            logger.info("✅ Successfully initialized MongoDB service")
        except Exception as e:
            error_msg = f"Failed to initialize MongoDB service: {str(e)}"
            logger.error(error_msg)
            _auth_mongodb_service = None
            raise ServiceInitializationError(error_msg) from e
    
    return _auth_mongodb_service

# For backward compatibility
try:
    auth_mongodb_service = get_mongodb_service()
except ServiceInitializationError:
    # This allows the app to start even if MongoDB is not available
    logger.warning("MongoDB service initialization failed. The app may not function correctly.")
    auth_mongodb_service = None
