from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services import mongodb_service
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mongodb_status(request):
    """Check MongoDB connection status"""
    try:
        # Test MongoDB connection
        reports_count = mongodb_service.get_emergency_reports(limit=1)
        return Response({
            'status': 'connected',
            'message': 'MongoDB is connected and working',
            'reports_count': len(reports_count)
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'MongoDB connection error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_emergency_report_mongodb(request):
    """Save emergency report to MongoDB"""
    try:
        report_data = {
            'report_id': f"mongodb_{request.data.get('id', 'unknown')}",
            'user_id': request.user.id,
            'username': request.user.username,
            'emergency_type': request.data.get('emergency_type', 'unknown'),
            'severity': request.data.get('severity', 'medium'),
            'location': request.data.get('location', {}),
            'description': request.data.get('description', ''),
            'images': request.data.get('images', []),
            'status': request.data.get('status', 'pending'),
            'ai_analysis': request.data.get('ai_analysis', {}),
            'fraud_score': request.data.get('fraud_score', 0.0),
            'metadata': request.data.get('metadata', {})
        }
        
        report = mongodb_service.save_emergency_report(report_data)
        if report:
            return Response({
                'success': True,
                'message': 'Report saved to MongoDB successfully',
                'report_id': str(report.id)
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to save report to MongoDB'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error saving report to MongoDB: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_emergency_reports_mongodb(request):
    """Get emergency reports from MongoDB"""
    try:
        filters = {}
        if request.GET.get('emergency_type'):
            filters['emergency_type'] = request.GET.get('emergency_type')
        if request.GET.get('status'):
            filters['status'] = request.GET.get('status')
        
        limit = int(request.GET.get('limit', 100))
        reports = mongodb_service.get_emergency_reports(filters=filters, limit=limit)
        
        reports_data = []
        for report in reports:
            reports_data.append({
                'id': str(report.id),
                'report_id': report.report_id,
                'user_id': report.user_id,
                'username': report.username,
                'emergency_type': report.emergency_type,
                'severity': report.severity,
                'location': report.location,
                'description': report.description,
                'images': report.images,
                'status': report.status,
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat(),
                'ai_analysis': report.ai_analysis,
                'fraud_score': report.fraud_score
            })
        
        return Response({
            'success': True,
            'reports': reports_data,
            'count': len(reports_data)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error getting reports from MongoDB: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_analytics_mongodb(request):
    """Save analytics data to MongoDB"""
    try:
        data_type = request.data.get('data_type', 'custom')
        data = request.data.get('data', {})
        user_id = request.user.id if request.user.is_authenticated else None
        
        analytics = mongodb_service.save_analytics_data(data_type, data, user_id)
        if analytics:
            return Response({
                'success': True,
                'message': 'Analytics data saved to MongoDB successfully',
                'analytics_id': str(analytics.id)
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to save analytics data to MongoDB'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error saving analytics data to MongoDB: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_geospatial_reports(request):
    """Get emergency reports within a radius using geospatial query"""
    try:
        lat = float(request.GET.get('lat', 0))
        lng = float(request.GET.get('lng', 0))
        radius_km = float(request.GET.get('radius', 10))
        
        reports = mongodb_service.get_geospatial_reports(lat, lng, radius_km)
        
        reports_data = []
        for report in reports:
            reports_data.append({
                'id': str(report.id),
                'report_id': report.report_id,
                'emergency_type': report.emergency_type,
                'severity': report.severity,
                'location': report.location,
                'description': report.description,
                'status': report.status,
                'created_at': report.created_at.isoformat(),
                'distance_km': radius_km  # This would be calculated in a real implementation
            })
        
        return Response({
            'success': True,
            'reports': reports_data,
            'count': len(reports_data),
            'center': {'lat': lat, 'lng': lng},
            'radius_km': radius_km
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error getting geospatial reports from MongoDB: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)