from django.urls import path
from . import views

urlpatterns = [
    # SOS Reports
    path('', views.SOSReportListCreateView.as_view(), name='sos_report_list_create'),
    path('<int:pk>/', views.SOSReportDetailView.as_view(), name='sos_report_detail'),
    path('<int:report_id>/assign/', views.assign_report, name='assign_report'),
    path('<int:report_id>/status/', views.update_report_status, name='update_report_status'),
    path('nearby/', views.nearby_reports, name='nearby_reports'),
    
    # Report Updates
    path('<int:report_id>/updates/', views.ReportUpdateListCreateView.as_view(), name='report_updates'),
    
    # Report Comments
    path('<int:report_id>/comments/', views.ReportCommentListCreateView.as_view(), name='report_comments'),
    
    # Emergency Resources
    path('resources/', views.EmergencyResourceListCreateView.as_view(), name='emergency_resources'),
    path('resources/<int:pk>/', views.EmergencyResourceDetailView.as_view(), name='emergency_resource_detail'),
]
