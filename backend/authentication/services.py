"""
Service instances for the authentication app.
This file is used to avoid circular imports by centralizing service instances.
"""

try:
    # Try absolute import first
    from authentication.mongodb_service import AuthMongoDBService
except ImportError:
    try:
        # Fall back to relative import if absolute fails
        from .mongodb_service import AuthMongoDBService
    except ImportError as e:
        # If both imports fail, raise a more descriptive error
        raise ImportError(
            "Could not import AuthMongoDBService from either 'authentication.mongodb_service' or '.mongodb_service'. "
            "Please ensure the class is defined in mongodb_service.py"
        ) from e

# Create a single instance of the AuthMongoDBService
auth_mongodb_service = AuthMongoDBService()
