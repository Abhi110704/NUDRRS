from django.http import JsonResponse
from django.db import connection
from django.conf import settings

def api_overview(request):
    """API overview endpoint - landing page for the root URL"""
    api_info = {
        'name': 'NUDRRS - National Unified Disaster Response & Relief System',
        'version': '1.0.0',
        'description': 'AI-Powered Emergency Response Platform',
        'endpoints': {
            'health_check': '/health/',
            'admin_panel': '/admin/',
            'authentication': '/api/auth/',
            'sos_reports': '/api/reports/',
            'ai_services': '/api/ai/',
            'notifications': '/api/notifications/',
            'resources': '/api/resources/',
            'analytics': '/api/analytics/'
        },
        'team': 'HackerXHacker - SIH 2025',
        'status': 'running'
    }
    return JsonResponse(api_info)

def health_check(request):
    """Health check endpoint for monitoring"""
    health_status = {
        'status': 'healthy',
        'database': 'unknown',
        'timestamp': None
    }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['database'] = 'healthy'
    except Exception as e:
        health_status['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Add timestamp
    from django.utils import timezone
    health_status['timestamp'] = timezone.now().isoformat()
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return JsonResponse(health_status, status=status_code)
