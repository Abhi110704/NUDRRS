# Authentication app for NUDRRS

# Import services to make them available at the package level
from .services import auth_mongodb_service
from .mongodb_service import AuthMongoDBService

# Import views
from .views import (
    RegisterView,
    login_view,
    logout_view,
    profile_view,
    change_password,
    password_reset_request,
    password_reset_verify_otp,
    password_reset_confirm,
    OrganizationListView,
    OrganizationDetailView,
    upload_profile_image
)

# Make these available when importing from authentication
__all__ = [
    'auth_mongodb_service',
    'AuthMongoDBService',
    'RegisterView',
    'login_view',
    'logout_view',
    'profile_view',
    'change_password',
    'password_reset_request',
    'password_reset_verify_otp',
    'password_reset_confirm',
    'OrganizationListView',
    'OrganizationDetailView',
    'upload_profile_image'
]
