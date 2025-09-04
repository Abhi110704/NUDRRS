from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('emergency-contacts/', views.emergency_contacts, name='emergency_contacts'),
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('responders/', views.ResponderListView.as_view(), name='responder_list'),
]
