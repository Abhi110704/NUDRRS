"""
Service instances for the authentication app.
This file is used to avoid circular imports by centralizing service instances.
"""
import logging

# Set up logging
logger = logging.getLogger(__name__)

try:
    # Import AuthMongoDBService from the current directory
    from .mongodb_service import AuthMongoDBService
    
    # Create a single instance of the AuthMongoDBService
    auth_mongodb_service = AuthMongoDBService()
    logger.info("Successfully initialized AuthMongoDBService")
    
except ImportError as e:
    logger.error(f"Failed to import AuthMongoDBService: {e}")
    raise

except Exception as e:
    logger.error(f"Error initializing AuthMongoDBService: {e}")
    raise
