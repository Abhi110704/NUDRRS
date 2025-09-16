from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from .models import SOSReport, ReportMedia, ReportUpdate, ReportVote
from .serializers import SOSReportSerializer, SOSReportCreateSerializer, ReportUpdateSerializer, ReportVoteSerializer
from .mongodb_service import mongodb_service
from ai_services.services import AIVerificationService
import json
import math
import uuid

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
        # This method is kept for compatibility but we'll use MongoDB service directly
        return SOSReport.objects.none()  # Return empty queryset since we're using MongoDB
    
    def list(self, request, *args, **kwargs):
        """List reports from MongoDB"""
        try:
            # Get query parameters
            user_id = request.query_params.get('user')
            limit = int(request.query_params.get('limit', 100))
            skip = int(request.query_params.get('skip', 0))
            
            # Get reports from MongoDB
            reports = mongodb_service.get_reports(
                filters={},
                limit=limit,
                skip=skip,
                user_id=user_id if user_id else None
            )
            
            return Response(reports)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, *args, **kwargs):
        """Get a single report from MongoDB"""
        try:
            report_id = kwargs.get('pk')
            report = mongodb_service.get_report_by_id(report_id)
            
            if report:
                return Response(report)
            else:
                return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request, *args, **kwargs):
        try:
            import time
            start_time = time.time()
            print(f"🚀 Starting report creation at {start_time}")
            
            # Get user information
            user_id = request.user.id if request.user.is_authenticated else 1  # Default to admin user
            username = request.user.username if request.user.is_authenticated else 'anonymous_user'
            
            # Generate unique report ID
            report_id = str(uuid.uuid4())
            
            # Prepare report data for MongoDB
            report_data = {
                'report_id': report_id,
                'user_id': user_id,
                'username': username,
                'emergency_type': request.data.get('emergency_type', 'OTHER'),
                'disaster_type': request.data.get('disaster_type', 'OTHER'),
                'severity': request.data.get('severity', 'MEDIUM'),
                'priority': request.data.get('priority', 'MEDIUM'),
                'description': request.data.get('description', ''),
                'phone_number': request.data.get('phone_number', ''),
                'latitude': float(request.data.get('latitude', 0)) if request.data.get('latitude') else None,
                'longitude': float(request.data.get('longitude', 0)) if request.data.get('longitude') else None,
                'address': request.data.get('address', ''),
                'location': {
                    'lat': float(request.data.get('latitude', 0)) if request.data.get('latitude') else None,
                    'lng': float(request.data.get('longitude', 0)) if request.data.get('longitude') else None,
                    'address': request.data.get('address', '')
                },
                'status': 'PENDING',
                'images': [],
                'media': [],
                'updates': [],
                'vote_counts': {},
                'vote_percentages': {},
                'user_vote': {},
                'ai_analysis_data': {},
                'ai_fraud_score': 0.0,
                'ai_confidence': 0.0,
                'ai_verified': 'pending',
                'verified': 'pending'
            }
            
            # Process uploaded media files using Cloudinary
            files = request.FILES.getlist('files')
            image_paths = []
            
            for file in files:
                media_type = 'IMAGE' if file.content_type.startswith('image/') else 'VIDEO'
                
                if media_type == 'IMAGE':
                    try:
                        # Upload to Cloudinary
                        from cloudinary_service import cloudinary_service
                        
                        # Generate unique filename
                        file_extension = file.name.split('.')[-1] if '.' in file.name else 'jpg'
                        unique_filename = f"{report_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
                        
                        # Upload to Cloudinary
                        upload_result = cloudinary_service.upload_file(
                            file=file,
                            folder=f"nudrrs/reports/{report_id}",
                            filename=unique_filename,
                            tags=['nudrrs', 'emergency_report', report_data['disaster_type'].lower()]
                        )
                        
                        if upload_result['success']:
                            # Store Cloudinary file info
                            media_info = {
                                'media_type': media_type,
                                'filename': unique_filename,
                                'content_type': file.content_type,
                                'size': file.size,
                                'file_id': upload_result['public_id'],
                                'public_id': upload_result['public_id'],
                                'url': upload_result['url'],
                                'format': upload_result.get('format'),
                                'width': upload_result.get('width'),
                                'height': upload_result.get('height'),
                                'bytes': upload_result.get('bytes'),
                                'created_at': upload_result.get('created_at'),
                                # Legacy compatibility fields
                                'imagekit_url': upload_result['url'],
                                'file_url': upload_result['url'],
                                'image_url': upload_result['url']
                            }
                            
                            report_data['media'].append(media_info)
                            image_paths.append(upload_result['url'])
                            report_data['images'].append(upload_result['url'])
                        else:
                            print(f"Cloudinary upload failed: {upload_result.get('error', 'Unknown error')}")
                            # Fallback to local storage
                            media_info = {
                                'media_type': media_type,
                                'filename': file.name,
                                'content_type': file.content_type,
                                'size': file.size,
                                'url': f"/media/reports/{file.name}",
                                'public_id': None,
                                'format': None,
                                'width': None,
                                'height': None,
                                'bytes': file.size,
                                'created_at': None,
                                # Legacy compatibility fields
                                'file_url': f"/media/reports/{file.name}",
                                'image_url': f"/media/reports/{file.name}"
                            }
                            report_data['media'].append(media_info)
                            image_paths.append(f"/media/reports/{file.name}")
                            report_data['images'].append(f"/media/reports/{file.name}")
                            
                    except Exception as e:
                        print(f"Cloudinary upload error: {e}")
                        # Fallback to local storage
                        media_info = {
                            'media_type': media_type,
                            'filename': file.name,
                            'content_type': file.content_type,
                            'size': file.size,
                            'url': f"/media/reports/{file.name}",
                            'file_url': f"/media/reports/{file.name}",
                            'image_url': f"/media/reports/{file.name}"
                        }
                        report_data['media'].append(media_info)
                        image_paths.append(f"/media/reports/{file.name}")
                        report_data['images'].append(f"/media/reports/{file.name}")
                else:
                    # For non-image files, store basic info
                    media_info = {
                        'media_type': media_type,
                        'filename': file.name,
                        'content_type': file.content_type,
                        'size': file.size
                    }
                    report_data['media'].append(media_info)
            
            # Set default AI analysis values for immediate report creation
            report_data['ai_verified'] = True
            report_data['ai_confidence'] = 0.5
            report_data['ai_fraud_score'] = 0.1
            report_data['ai_analysis_data'] = {'status': 'pending', 'source': 'async_analysis'}
            
            # Create report in MongoDB
            print(f"📝 Creating report in MongoDB...")
            created_report = mongodb_service.create_report(report_data)
            
            end_time = time.time()
            print(f"✅ Report creation completed in {end_time - start_time:.2f} seconds")
            
            if created_report:
                # Start AI analysis in background (non-blocking)
                if image_paths or report_data['description']:
                    try:
                        import threading
                        def run_ai_analysis():
                            try:
                                ai_service = AIVerificationService()
                                comprehensive_analysis = ai_service.analyze_report(
                                    text_description=report_data['description'],
                                    image_paths=image_paths
                                )
                                
                                # Update report with AI analysis results
                                update_data = {
                                    'ai_verified': comprehensive_analysis.get('is_emergency', False),
                                    'ai_confidence': comprehensive_analysis.get('confidence', 0.0),
                                    'ai_fraud_score': comprehensive_analysis.get('fraud_score', 0.0),
                                    'ai_analysis_data': comprehensive_analysis,
                                    'updated_at': timezone.now().isoformat()
                                }
                                
                                # Enhanced priority determination based on AI analysis
                                suggested_priority = comprehensive_analysis.get('suggested_priority', 'MEDIUM')
                                confidence = comprehensive_analysis.get('confidence', 0.0)
                                fraud_score = comprehensive_analysis.get('fraud_score', 0.0)
                                
                                # Override priority based on confidence and fraud score
                                if fraud_score > 0.7 or confidence < 0.3:
                                    update_data['priority'] = 'LOW'
                                elif confidence > 0.8 and fraud_score < 0.2:
                                    update_data['priority'] = 'HIGH'
                                elif confidence > 0.6 and fraud_score < 0.4:
                                    update_data['priority'] = 'MEDIUM'
                                else:
                                    update_data['priority'] = suggested_priority
                                
                                # Enhanced status determination
                                if comprehensive_analysis.get('is_fraud', False) or fraud_score > 0.6:
                                    update_data['status'] = 'REJECTED'
                                elif comprehensive_analysis.get('suggested_status'):
                                    update_data['status'] = comprehensive_analysis.get('suggested_status', 'PENDING')
                                elif confidence > 0.8 and fraud_score < 0.2:
                                    update_data['status'] = 'VERIFIED'
                                
                                # Update the report with AI analysis results
                                mongodb_service.update_report(created_report['id'], update_data)
                                print(f"🤖 AI analysis completed for report {created_report['id']}")
                                
                            except Exception as e:
                                print(f"Background AI analysis failed: {e}")
                        
                        # Start background thread
                        ai_thread = threading.Thread(target=run_ai_analysis)
                        ai_thread.daemon = True
                        ai_thread.start()
                        print(f"🤖 Started background AI analysis for report {created_report['id']}")
                        
                    except Exception as e:
                        print(f"Failed to start background AI analysis: {e}")
                
                return Response(created_report, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Failed to create report'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 10)  # km
        
        if not lat or not lng:
            return Response({'error': 'lat and lng parameters required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
            
            # Get nearby reports from MongoDB
            reports = mongodb_service.get_nearby_reports(lat, lng, radius)
            
            return Response(reports)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get', 'post', 'delete'])
    def updates(self, request, pk=None):
        """Get or create report updates/comments"""
        try:
            report_id = pk
            
            if request.method == 'GET':
                # Get all updates for this report from MongoDB
                report = mongodb_service.get_report_by_id(report_id)
                if report:
                    updates = report.get('updates', [])
                    return Response(updates)
                else:
                    return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
            
            elif request.method == 'POST':
                # Create a new update/comment
                user_id = request.user.id if request.user.is_authenticated else 1
                username = request.user.username if request.user.is_authenticated else 'anonymous_user'
                
                comment_data = {
                    'user_id': user_id,
                    'username': username,
                    'message': request.data.get('message', ''),
                    'status_change': request.data.get('status_change', ''),
                    'created_at': timezone.now().isoformat(),
                    'timestamp': timezone.now().timestamp()  # Add timestamp for sorting
                }
                
                # Add comment to MongoDB
                result = mongodb_service.add_comment(report_id, comment_data)
                
                if result:
                    return Response(result, status=status.HTTP_201_CREATED)
                else:
                    return Response({'error': 'Failed to add comment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            elif request.method == 'DELETE':
                # Delete a specific comment
                comment_id = request.data.get('comment_id')
                if not comment_id:
                    return Response({'error': 'comment_id is required'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Get the report to check permissions
                report = mongodb_service.get_report_by_id(report_id)
                if not report:
                    return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Check if user has permission to delete comment
                user_id = request.user.id if request.user.is_authenticated else None
                username = request.user.username if request.user.is_authenticated else None
                
                # Find the comment to check ownership
                comment_to_delete = None
                comment_index = None
                for i, comment in enumerate(report.get('updates', [])):
                    if str(comment.get('_id', '')) == str(comment_id) or str(comment.get('id', '')) == str(comment_id):
                        comment_to_delete = comment
                        comment_index = i
                        break
                
                if not comment_to_delete:
                    return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Check permissions: comment author, report owner, or admin
                is_comment_author = (user_id and str(comment_to_delete.get('user_id')) == str(user_id))
                is_report_owner = (user_id and str(report.get('user_id')) == str(user_id))
                is_admin = (hasattr(request.user, '_user_data') and request.user._user_data.get('role') == 'ADMIN') or \
                          (hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN')
                
                if not (is_comment_author or is_report_owner or is_admin):
                    return Response({'error': 'Permission denied. Only comment author, report owner, or admin can delete comments.'}, 
                                  status=status.HTTP_403_FORBIDDEN)
                
                # Delete the comment
                success = mongodb_service.delete_comment_by_id(report_id, comment_id)
                
                if success:
                    return Response({'message': 'Comment deleted successfully'}, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Failed to delete comment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get', 'post'])
    def votes(self, request, pk=None):
        """Get or create report votes"""
        try:
            # Get report from MongoDB
            report = mongodb_service.get_report_by_id(pk)
            if not report:
                return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if request.method == 'GET':
                # Get vote counts from the report
                vote_counts = report.get('vote_counts', {})
                return Response(vote_counts)
            
            elif request.method == 'POST':
                # Create or update a vote
                vote_type = request.data.get('vote_type')
                if not vote_type:
                    return Response({'error': 'vote_type is required'}, status=status.HTTP_400_BAD_REQUEST)
                
                if vote_type not in ['STILL_THERE', 'RESOLVED', 'FAKE_REPORT']:
                    return Response({'error': 'Invalid vote_type'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Get user ID
                user_id = request.user.id if hasattr(request.user, 'id') else None
                if not user_id:
                    return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
                
                # Prepare vote data
                vote_data = {
                    'user_id': str(user_id),
                    'username': request.user.username,
                    'vote_type': vote_type,
                    'created_at': timezone.now().isoformat()
                }
                
                # Record vote in MongoDB
                result = mongodb_service.add_vote(pk, vote_data)
                
                if result:
                    # Get updated report with new vote counts
                    updated_report = mongodb_service.get_report_by_id(pk)
                    vote_counts = updated_report.get('vote_counts', {})
                    
                    return Response({
                        'success': True,
                        'message': f'Vote recorded: {vote_type}',
                        'vote_counts': vote_counts,
                        'user_vote': vote_type
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Failed to record vote'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
        except Exception as e:
            return Response({'error': f'Voting error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
        try:
            # Get user ID for filtering if needed
            user_id = request.query_params.get('user')
            
            # Get dashboard stats from MongoDB
            stats = mongodb_service.get_dashboard_stats(user_id)
            
            return Response(stats)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
    
    def destroy(self, request, *args, **kwargs):
        """Delete a report from MongoDB"""
        try:
            # Get the report_id from URL parameters
            report_id = kwargs.get('pk')
            
            if not report_id:
                return Response({'error': 'Report ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if report exists
            report = mongodb_service.get_report_by_id(report_id)
            if not report:
                return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if user has permission to delete (admin or report owner)
            user_id = None
            if hasattr(request.user, '_user_data'):
                user_id = request.user._user_data.get('id')
            elif hasattr(request.user, 'id'):
                user_id = str(request.user.id)
            
            # Check permissions
            is_admin = False
            if hasattr(request.user, '_user_data'):
                is_admin = request.user._user_data.get('role') == 'ADMIN'
            elif hasattr(request.user, 'profile'):
                is_admin = request.user.profile.role == 'ADMIN'
            
            is_owner = user_id and (report.get('user_id') == user_id)
            
            if not (is_admin or is_owner):
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Delete the report from MongoDB
            success = mongodb_service.delete_report(report_id)
            
            if success:
                return Response({'message': 'Report deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'Failed to delete report'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
