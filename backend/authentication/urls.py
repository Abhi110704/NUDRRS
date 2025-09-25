from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('password-reset/request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset/verify-otp/', views.password_reset_verify_otp, name='password_reset_verify_otp'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('organizations/', views.OrganizationListView.as_view(), name='organization_list'),
    path('organizations/<str:org_id>/', views.OrganizationDetailView.as_view(), name='organization_detail'),
    path('profile/upload-image/', views.upload_profile_image, name='upload_profile_image'),
]
