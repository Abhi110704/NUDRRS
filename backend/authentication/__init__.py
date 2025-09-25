# Authentication app for NUDRRS

# Import services to make them available at the package level
from .services import auth_mongodb_service
from .mongodb_service import AuthMongoDBService

# Import views to make them available at the package level
# Using absolute imports to avoid circular imports
from authentication.views import RegisterView as RegisterView
from authentication.views import login_view as login_view
from authentication.views import logout_view as logout_view
from authentication.views import profile_view as profile_view
from authentication.views import change_password as change_password
from authentication.views import password_reset_request as password_reset_request
from authentication.views import password_reset_verify_otp as password_reset_verify_otp
from authentication.views import password_reset_confirm as password_reset_confirm
from authentication.views import OrganizationListView as OrganizationListView
from authentication.views import OrganizationDetailView as OrganizationDetailView
from authentication.views import upload_profile_image as upload_profile_image

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
