import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock,
  TrendingUp,
  Activity,
  Shield,
  Phone
} from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import AlertsList from '../components/Dashboard/AlertsList';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import QuickActions from '../components/Dashboard/QuickActions';

const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();

  const stats = [
    {
      title: 'Active Alerts',
      value: '23',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+12%',
      changeType: 'increase' as const
    },
    {
      title: 'People Helped',
      value: '1,247',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8%',
      changeType: 'increase' as const
    },
    {
      title: 'Response Teams',
      value: '45',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '100%',
      changeType: 'increase' as const
    },
    {
      title: 'Avg Response Time',
      value: '8.2 min',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-15%',
      changeType: 'decrease' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      {user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Welcome back, <strong>{userProfile?.full_name || 'User'}</strong>! 
            {userProfile?.role === 'admin' && ' You have admin access to manage the system.'}
          </p>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              National Unified Disaster Response System
            </h1>
            <p className="text-blue-100 text-lg">
              Real-time coordination for emergency response across India
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-blue-200">Active Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AlertsList />
        </div>

        {/* Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <Activity className="h-5 w-5 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2.3s</div>
            <div className="text-sm text-gray-600">Avg API Response</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">847</div>
            <div className="text-sm text-gray-600">Active Connections</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;