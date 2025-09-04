import React from 'react';
import { 
  Check, 
  AlertCircle, 
  Users, 
  Truck,
  Shield,
  Heart
} from 'lucide-react';

const ActivityFeed: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'rescue',
      title: 'Rescue Operation Completed',
      description: '45 people evacuated from flood zone',
      location: 'Kochi, Kerala',
      time: '5 min ago',
      icon: Shield,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 2,
      type: 'medical',
      title: 'Medical Team Deployed',
      description: 'Emergency medical assistance dispatched',
      location: 'Dehradun, Uttarakhand',
      time: '18 min ago',
      icon: Heart,
      color: 'text-red-600 bg-red-100'
    },
    {
      id: 3,
      type: 'supplies',
      title: 'Relief Supplies Distributed',
      description: 'Food packets and water distributed',
      location: 'Jodhpur, Rajasthan',
      time: '32 min ago',
      icon: Truck,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 4,
      type: 'alert',
      title: 'New Alert Issued',
      description: 'Cyclone warning for coastal areas',
      location: 'Bhubaneswar, Odisha',
      time: '45 min ago',
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      id: 5,
      type: 'team',
      title: 'Response Team Activated',
      description: 'NDRF team mobilized for flood response',
      location: 'Patna, Bihar',
      time: '1 hour ago',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 6,
      type: 'completed',
      title: 'Evacuation Completed',
      description: 'All residents safely relocated',
      location: 'Guwahati, Assam',
      time: '2 hours ago',
      icon: Check,
      color: 'text-green-600 bg-green-100'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Real-time Activity Feed</h2>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${activity.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                    <span>{activity.location}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-gray-50 rounded-b-xl">
        <button className="w-full text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors">
          View Full Activity Log →
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;