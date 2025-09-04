from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count
from .models import SOSReport, ReportMedia, ReportUpdate
from .serializers import SOSReportSerializer, SOSReportCreateSerializer, ReportMediaSerializer
from ai_services.services import AIVerificationService
import json
import math

class SOSReportViewSet(viewsets.ModelViewSet):
    queryset = SOSReport.objects.all()
    serializer_class = SOSReportSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SOSReportCreateSerializer
        return SOSReportSerializer
    
    def get_queryset(self):
        # Filter by demo mode if specified
        is_demo = self.request.query_params.get('is_demo', 'false').lower() == 'true'
        return SOSReport.objects.filter(is_demo=is_demo)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the report
        report = serializer.save(user=request.user if request.user.is_authenticated else None)
        
        # Process uploaded media files
        files = request.FILES.getlist('files')
        for file in files:
            media_type = 'IMAGE' if file.content_type.startswith('image/') else 'VIDEO'
            media = ReportMedia.objects.create(
                report=report,
                media_type=media_type,
                file=file
            )
            
            # Trigger AI verification
            ai_service = AIVerificationService()
            if media_type == 'IMAGE':
                verification_result = ai_service.verify_image(media.file.path)
                media.ai_analysis = verification_result
                media.save()
                
                # Update report based on AI analysis
                if verification_result.get('is_emergency', False):
                    report.ai_verified = True
                    report.ai_confidence = verification_result.get('confidence', 0.0)
                    report.priority = verification_result.get('suggested_priority', 'MEDIUM')
                    report.save()
        
        return Response(SOSReportSerializer(report).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 10)  # km
        is_demo = request.query_params.get('is_demo', 'false').lower() == 'true'
        
        if not lat or not lng:
            return Response({'error': 'lat and lng parameters required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Simple distance calculation using Haversine formula
        lat = float(lat)
        lng = float(lng)
        radius = float(radius)
        
        # Convert radius from km to degrees (approximate)
        lat_range = radius / 111.0  # 1 degree lat ≈ 111 km
        lng_range = radius / (111.0 * math.cos(math.radians(lat)))
        
        reports = SOSReport.objects.filter(
            latitude__range=(lat - lat_range, lat + lat_range),
            longitude__range=(lng - lng_range, lng + lng_range),
            status__in=['PENDING', 'VERIFIED', 'IN_PROGRESS'],
            is_demo=is_demo
        )
        
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for reports"""
        is_demo = request.query_params.get('is_demo', 'false').lower() == 'true'
        queryset = SOSReport.objects.filter(is_demo=is_demo)
        
        # Calculate statistics
        total_reports = queryset.count()
        pending_reports = queryset.filter(status='PENDING').count()
        active_reports = queryset.filter(status__in=['VERIFIED', 'IN_PROGRESS']).count()
        resolved_reports = queryset.filter(status='RESOLVED').count()
        
        # Disaster type breakdown
        disaster_types = queryset.values('disaster_type').annotate(
            count=Count('disaster_type')
        ).order_by('-count')
        by_disaster_type = {item['disaster_type']: item['count'] for item in disaster_types}
        
        # Priority breakdown
        priorities = queryset.values('priority').annotate(
            count=Count('priority')
        ).order_by('-count')
        by_priority = {item['priority']: item['count'] for item in priorities}
        
        stats = {
            'total_reports': total_reports,
            'pending_reports': pending_reports,
            'active_reports': active_reports,
            'resolved_reports': resolved_reports,
            'by_disaster_type': by_disaster_type,
            'by_priority': by_priority
        }
        
        return Response(stats)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')
        message = request.data.get('message', '')
        
        if new_status not in dict(SOSReport.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        old_status = report.status
        report.status = new_status
        report.save()
        
        # Create update record
        ReportUpdate.objects.create(
            report=report,
            user=request.user,
            message=message,
            status_change=f"{old_status} -> {new_status}"
        )
        
        return Response({'message': 'Status updated successfully'})
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        # Use the filtered queryset from get_queryset
        reports = self.get_queryset()
        
        stats = {
            'total_reports': reports.count(),
            'pending_reports': reports.filter(status='PENDING').count(),
            'active_reports': reports.filter(status__in=['VERIFIED', 'IN_PROGRESS']).count(),
            'resolved_reports': reports.filter(status='RESOLVED').count(),
            'by_disaster_type': {},
            'by_priority': {}
        }
        
        # Disaster type breakdown
        for disaster_type, _ in SOSReport.DISASTER_TYPES:
            count = reports.filter(disaster_type=disaster_type).count()
            stats['by_disaster_type'][disaster_type] = count
        
        # Priority breakdown
        for priority, _ in SOSReport.PRIORITY_CHOICES:
            count = reports.filter(priority=priority).count()
            stats['by_priority'][priority] = count
        
        return Response(stats)
