from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from .models import SOSReport, ReportMedia, ReportUpdate, ReportVote
from .serializers import SOSReportSerializer, SOSReportCreateSerializer, ReportUpdateSerializer, ReportVoteSerializer
from ai_services.services import AIVerificationService
import json
import math

class SOSReportViewSet(viewsets.ModelViewSet):
    queryset = SOSReport.objects.all()
    serializer_class = SOSReportSerializer
    permission_classes = [AllowAny]  # Allow public access for dashboard data
    
    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve', 'dashboard_stats', 'nearby']:
            permission_classes = [AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [AllowAny]  # Allow updates for now, can be restricted later
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SOSReportCreateSerializer
        return SOSReportSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = SOSReport.objects.all()
        
        # Filter by user if specified and user is not admin
        user_id = self.request.query_params.get('user')
        if user_id and not (self.request.user.is_authenticated and 
                           hasattr(self.request.user, 'profile') and 
                           self.request.user.profile.role == 'ADMIN'):
            queryset = queryset.filter(user_id=user_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get or create a default anonymous user for unauthenticated reports
        from django.contrib.auth.models import User
        if request.user.is_authenticated:
            user = request.user
        else:
            # Create or get anonymous user
            user, created = User.objects.get_or_create(
                username='anonymous_user',
                defaults={
                    'first_name': 'Anonymous',
                    'last_name': 'User',
                    'email': 'anonymous@nudrrs.com'
                }
            )
        
        # Create the report
        report = serializer.save(user=user)
        
        # Process uploaded media files and perform comprehensive AI analysis
        files = request.FILES.getlist('files')
        image_paths = []
        
        for file in files:
            media_type = 'IMAGE' if file.content_type.startswith('image/') else 'VIDEO'
            media = ReportMedia.objects.create(
                report=report,
                media_type=media_type,
                file=file
            )
            
            if media_type == 'IMAGE':
                image_paths.append(media.file.path)
        
        # Perform comprehensive AI analysis
        ai_service = AIVerificationService()
        comprehensive_analysis = ai_service.analyze_report(
            text_description=report.description,
            image_paths=image_paths
        )
        
        # Update report with comprehensive analysis results
        report.ai_verified = comprehensive_analysis.get('is_emergency', False)
        report.ai_confidence = comprehensive_analysis.get('confidence', 0.0)
        
        # Store fraud score and detailed analysis in existing fields
        fraud_score = comprehensive_analysis.get('fraud_score', 0.0)
        report.ai_fraud_score = fraud_score
        report.ai_analysis_data = {
            'comprehensive_analysis': comprehensive_analysis,
            'text_analysis': comprehensive_analysis.get('text_analysis', {}),
            'image_analyses': comprehensive_analysis.get('image_analyses', []),
            'combined_metrics': comprehensive_analysis.get('combined_metrics', {}),
            'fraud_indicators': comprehensive_analysis.get('text_analysis', {}).get('fraud_keywords_found', []),
            'emergency_indicators': comprehensive_analysis.get('text_analysis', {}).get('keywords_found', []),
            'analysis_timestamp': timezone.now().isoformat(),
            'analysis_version': '2.0_enhanced'
        }
        
        # Enhanced priority determination based on AI analysis
        suggested_priority = comprehensive_analysis.get('suggested_priority', 'MEDIUM')
        confidence = comprehensive_analysis.get('confidence', 0.0)
        
        # Override priority based on confidence and fraud score
        if fraud_score > 0.7 or confidence < 0.3:
            report.priority = 'LOW'  # Mark as low priority if likely fraud
        elif confidence > 0.8 and fraud_score < 0.2:
            report.priority = 'HIGH'  # High confidence, low fraud = high priority
        elif confidence > 0.6 and fraud_score < 0.4:
            report.priority = 'MEDIUM'
        else:
            report.priority = suggested_priority
        
        # Enhanced status determination
        if comprehensive_analysis.get('is_fraud', False) or fraud_score > 0.6:
            report.status = 'REJECTED'
        elif comprehensive_analysis.get('suggested_status'):
            report.status = comprehensive_analysis.get('suggested_status', 'PENDING')
        elif confidence > 0.8 and fraud_score < 0.2:
            report.status = 'VERIFIED'  # Auto-verify high confidence reports
        else:
            report.status = 'PENDING'
        
        report.save()
        
        # Store detailed AI analysis in media records
        for i, file in enumerate(files):
            if file.content_type.startswith('image/'):
                media = ReportMedia.objects.filter(report=report, file__icontains=file.name).first()
                if media and i < len(comprehensive_analysis.get('image_analyses', [])):
                    media.ai_analysis = comprehensive_analysis['image_analyses'][i]
                    media.save()
        
        return Response(SOSReportSerializer(report).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 10)  # km
        
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
            status__in=['PENDING', 'VERIFIED', 'IN_PROGRESS']
        )
        
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'])
    def updates(self, request, pk=None):
        """Get or create report updates/comments"""
        report = self.get_object()
        
        if request.method == 'GET':
            # Get all updates for this report
            updates = report.updates.all()
            serializer = ReportUpdateSerializer(updates, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create a new update/comment
            serializer = ReportUpdateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(report=report, user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def votes(self, request, pk=None):
        """Get or create report votes"""
        report = self.get_object()
        
        if request.method == 'GET':
            # Get all votes for this report
            votes = report.votes.all()
            serializer = ReportVoteSerializer(votes, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create or update a vote
            vote_type = request.data.get('vote_type')
            if not vote_type:
                return Response({'error': 'vote_type is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if vote_type not in ['STILL_THERE', 'RESOLVED', 'FAKE_REPORT']:
                return Response({'error': 'Invalid vote_type'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create vote
            vote, created = ReportVote.objects.get_or_create(
                report=report,
                user=request.user,
                defaults={'vote_type': vote_type}
            )
            
            if not created:
                # Update existing vote
                vote.vote_type = vote_type
                vote.save()
            
            # Check and update report status based on votes
            report.check_and_update_status()
            
            serializer = ReportVoteSerializer(vote)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        """Custom update method to handle file uploads for existing reports"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Get the serializer
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Save the report
        report = serializer.save()
        
        # Process uploaded media files if any
        files = request.FILES.getlist('files')
        if files:
            image_paths = []
            
            for file in files:
                media_type = 'IMAGE' if file.content_type.startswith('image/') else 'VIDEO'
                media = ReportMedia.objects.create(
                    report=report,
                    media_type=media_type,
                    file=file
                )
                
                if media_type == 'IMAGE':
                    image_paths.append(media.file.path)
            
            # Perform AI analysis on new images if any
            if image_paths:
                ai_service = AIVerificationService()
                comprehensive_analysis = ai_service.analyze_report(
                    text_description=report.description,
                    image_paths=image_paths
                )
                
                # Update report with AI analysis results
                report.ai_verified = comprehensive_analysis.get('is_emergency', False)
                report.ai_confidence = comprehensive_analysis.get('confidence', 0.0)
                report.ai_fraud_score = comprehensive_analysis.get('fraud_score', 0.0)
                report.ai_analysis_data = comprehensive_analysis
                report.save()
        
        # Return the updated report with media
        response_serializer = SOSReportSerializer(report, context={'request': request})
        return Response(response_serializer.data)

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
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def verify(self, request, pk=None):
        """Admin verification of a report"""
        from django.utils import timezone
        
        report = self.get_object()
        
        # Check if user is admin
        if not (hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN'):
            return Response({'error': 'Admin privileges required'}, status=status.HTTP_403_FORBIDDEN)
        
        action_type = request.data.get('action', 'verify')
        
        if action_type == 'verify':
            report.status = 'VERIFIED'
            report.verified_by = request.user
            report.verified_at = timezone.now()
        elif action_type == 'reject':
            report.status = 'REJECTED'
            report.verified_by = request.user
            report.verified_at = timezone.now()
        
        report.save()
        
        return Response({
            'message': f'Report {action_type}ed successfully',
            'report': SOSReportSerializer(report).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def admin_stats(self, request):
        """Get admin-specific statistics"""
        # Check if user is admin
        if not (hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN'):
            return Response({'error': 'Admin privileges required'}, status=status.HTTP_403_FORBIDDEN)
        
        queryset = self.get_queryset()
        
        stats = {
            'total_reports': queryset.count(),
            'pending_verification': queryset.filter(status='PENDING').count(),
            'verified_reports': queryset.filter(status='VERIFIED').count(),
            'rejected_reports': queryset.filter(status='REJECTED').count(),
            'high_priority_pending': queryset.filter(status='PENDING', priority__in=['HIGH', 'CRITICAL']).count(),
            'recent_reports': queryset.order_by('-created_at')[:10].count()
        }
        
        return Response(stats)
