from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import SOSReport, ReportUpdate, ReportComment, EmergencyResource
from .serializers import (
    SOSReportSerializer, SOSReportCreateSerializer, SOSReportListSerializer,
    ReportUpdateSerializer, ReportCommentSerializer, EmergencyResourceSerializer
)


class SOSReportListCreateView(generics.ListCreateAPIView):
    """
    List all SOS reports or create a new one
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'priority', 'status', 'ai_verified']
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SOSReportCreateSerializer
        return SOSReportListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_authority:
            return SOSReport.objects.all()
        elif user.is_responder:
            return SOSReport.objects.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        else:
            return SOSReport.objects.filter(reporter=user)


class SOSReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a SOS report
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SOSReportSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_authority:
            return SOSReport.objects.all()
        elif user.is_responder:
            return SOSReport.objects.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        else:
            return SOSReport.objects.filter(reporter=user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_report(request, report_id):
    """
    Assign a report to a responder
    """
    try:
        report = SOSReport.objects.get(id=report_id)
        responder_id = request.data.get('responder_id')
        
        if not responder_id:
            return Response(
                {'error': 'Responder ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        responder = User.objects.get(id=responder_id, role='responder')
        
        report.assigned_to = responder
        report.save()
        
        # Create update record
        ReportUpdate.objects.create(
            report=report,
            updated_by=request.user,
            update_type='assignment',
            description=f'Report assigned to {responder.get_full_name()}'
        )
        
        return Response({
            'message': 'Report assigned successfully',
            'assigned_to': responder.get_full_name()
        })
        
    except SOSReport.DoesNotExist:
        return Response(
            {'error': 'Report not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except User.DoesNotExist:
        return Response(
            {'error': 'Responder not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_report_status(request, report_id):
    """
    Update the status of a report
    """
    try:
        report = SOSReport.objects.get(id=report_id)
        new_status = request.data.get('status')
        
        if new_status not in dict(SOSReport.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = report.status
        report.status = new_status
        
        if new_status == 'resolved':
            from django.utils import timezone
            report.resolved_at = timezone.now()
        
        report.save()
        
        # Create update record
        ReportUpdate.objects.create(
            report=report,
            updated_by=request.user,
            update_type='status_change',
            description=f'Status changed from {old_status} to {new_status}'
        )
        
        return Response({
            'message': 'Status updated successfully',
            'new_status': new_status
        })
        
    except SOSReport.DoesNotExist:
        return Response(
            {'error': 'Report not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def nearby_reports(request):
    """
    Get reports near a specific location
    """
    latitude = request.GET.get('lat')
    longitude = request.GET.get('lng')
    radius = request.GET.get('radius', 10)  # km
    
    if not latitude or not longitude:
        return Response(
            {'error': 'Latitude and longitude are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from geopy.distance import geodesic
        
        user_location = (float(latitude), float(longitude))
        nearby_reports = []
        
        for report in SOSReport.objects.filter(status__in=['pending', 'verified', 'in_progress']):
            report_location = (float(report.latitude), float(report.longitude))
            distance = geodesic(user_location, report_location).kilometers
            
            if distance <= float(radius):
                report_data = SOSReportSerializer(report).data
                report_data['distance_km'] = round(distance, 2)
                nearby_reports.append(report_data)
        
        return Response(nearby_reports)
        
    except ValueError:
        return Response(
            {'error': 'Invalid coordinates'},
            status=status.HTTP_400_BAD_REQUEST
        )


class EmergencyResourceListCreateView(generics.ListCreateAPIView):
    """
    List all emergency resources or create a new one
    """
    queryset = EmergencyResource.objects.all()
    serializer_class = EmergencyResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['resource_type', 'is_available']
    search_fields = ['name', 'description', 'contact_person']


class EmergencyResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an emergency resource
    """
    queryset = EmergencyResource.objects.all()
    serializer_class = EmergencyResourceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReportUpdateListCreateView(generics.ListCreateAPIView):
    """
    List updates for a report or create a new update
    """
    serializer_class = ReportUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        report_id = self.kwargs['report_id']
        return ReportUpdate.objects.filter(report_id=report_id)
    
    def perform_create(self, serializer):
        report_id = self.kwargs['report_id']
        report = SOSReport.objects.get(id=report_id)
        serializer.save(
            report=report,
            updated_by=self.request.user
        )


class ReportCommentListCreateView(generics.ListCreateAPIView):
    """
    List comments for a report or create a new comment
    """
    serializer_class = ReportCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        report_id = self.kwargs['report_id']
        user = self.request.user
        if user.is_admin or user.is_authority:
            return ReportComment.objects.filter(report_id=report_id)
        else:
            return ReportComment.objects.filter(
                report_id=report_id,
                is_internal=False
            )