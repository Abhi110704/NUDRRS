"""
Service instances for the authentication app.
This file is used to avoid circular imports by centralizing service instances.
"""
from .mongodb_service import AuthMongoDBService

# Create a single instance of the AuthMongoDBService
auth_mongodb_service = AuthMongoDBService()
