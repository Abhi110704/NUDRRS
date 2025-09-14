from django.urls import path
from .auth_views import mongodb_auth

urlpatterns = [
    path('register/', mongodb_auth.register_user, name='mongodb_register'),
    path('login/', mongodb_auth.login_user, name='mongodb_login'),
    path('logout/', mongodb_auth.logout_user, name='mongodb_logout'),
    path('profile/', mongodb_auth.get_user_profile, name='mongodb_profile'),
    path('profile/update/', mongodb_auth.update_user_profile, name='mongodb_update_profile'),
    path('change-password/', mongodb_auth.change_password, name='mongodb_change_password'),
]
