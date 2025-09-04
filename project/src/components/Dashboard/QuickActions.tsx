import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Map, 
  MessageCircle, 
  Phone,
  Users,
  Megaphone
} from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Report Emergency',
      description: 'Submit SOS report with location',
      icon: AlertTriangle,
      path: '/sos',
      color: 'bg-red-600 hover:bg-red-700',
      urgent: true
    },
    {
      title: 'View Map',
      description: 'Live disaster tracking',
      icon: Map,
      path: '/map',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Get Help',
      description: 'AI assistance chatbot',
      icon: MessageCircle,
      path: '/chatbot',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Emergency Contacts',
      description: 'Helplines & shelters',
      icon: Phone,
      path: '/contacts',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      title: 'Resource Center',
      description: 'Allocation dashboard',
      icon: Users,
      path: '/resources',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Broadcast Alert',
      description: 'Send mass notifications',
      icon: Megaphone,
      path: '#',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.path}
              className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                action.urgent ? 'ring-2 ring-red-300 ring-offset-2' : ''
              }`}
            >
              <Icon className="h-6 w-6 mb-2" />
              <h3 className="font-medium text-sm">{action.title}</h3>
              <p className="text-xs opacity-90 mt-1">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;