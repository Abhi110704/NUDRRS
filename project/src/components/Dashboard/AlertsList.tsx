import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Alert {
  id: number;
  title: string;
  description: string;
  type: 'emergency' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'dismissed';
  timestamp: string;
  location: string;
}

const AlertsList: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockAlerts: Alert[] = [
        {
          id: 1,
          title: 'Flood Warning',
          description: 'Heavy rainfall expected in the next 2 hours. Please stay indoors.',
          type: 'emergency',
          status: 'active',
          timestamp: new Date().toISOString(),
          location: 'Delhi, India'
        },
        {
          id: 2,
          title: 'Medical Emergency',
          description: 'Person injured in road accident. Ambulance dispatched.',
          type: 'emergency',
          status: 'active',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          location: 'Connaught Place, Delhi'
        },
        {
          id: 3,
          title: 'Fire Alert',
          description: 'Fire reported in residential building. Fire department responding.',
          type: 'emergency',
          status: 'resolved',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          location: 'Karol Bagh, Delhi'
        },
        {
          id: 4,
          title: 'Weather Update',
          description: 'Temperature expected to drop significantly tonight.',
          type: 'warning',
          status: 'active',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          location: 'Delhi, India'
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Alerts</h3>
      
      {alerts.length > 0 ? (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{alert.location}</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(alert.status)}
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {alert.status}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No alerts at this time</p>
        </div>
      )}
    </div>
  );
};

export default AlertsList;