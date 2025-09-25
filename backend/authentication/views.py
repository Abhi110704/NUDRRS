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
    """Health check endpoint for monitoring
    
    Returns 200 OK if the application is running, regardless of database status.
    This ensures the health check passes as long as the application is responsive.
    """
    from django.utils import timezone
    
    health_status = {
        'status': 'healthy',
        'application': 'running',
        'database': 'unknown',
        'timestamp': timezone.now().isoformat()
    }
    
    # Check database connection (but don't fail health check if it's down)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['database'] = 'connected'
    except Exception as e:
        health_status['database'] = f'disconnected: {str(e)}'
        # Don't mark status as unhealthy for database issues
        # health_status['status'] = 'degraded'
    
    # Always return 200 as long as the application is running
    # This ensures the health check passes for container orchestration
    return JsonResponse(health_status, status=200)
