import React, { useState } from 'react';
import { 
  Users, 
  Truck, 
  Shield, 
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ResourceAllocation: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const teams = [
    {
      id: 'ndrf-01',
      name: 'NDRF Team Alpha',
      type: 'Rescue',
      status: 'deployed',
      location: 'Kochi, Kerala',
      members: 25,
      equipment: ['Boats', 'Life Jackets', 'Medical Kit'],
      eta: '15 min',
      icon: Shield,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'med-02',
      name: 'Medical Unit Beta',
      type: 'Medical',
      status: 'available',
      location: 'Base Station, Delhi',
      members: 12,
      equipment: ['Ambulance', 'Medical Supplies', 'Defibrillator'],
      eta: '45 min',
      icon: Heart,
      color: 'text-red-600 bg-red-100'
    },
    {
      id: 'supply-03',
      name: 'Supply Chain Gamma',
      type: 'Logistics',
      status: 'en-route',
      location: 'En route to Dehradun',
      members: 8,
      equipment: ['Food Packets', 'Water', 'Blankets'],
      eta: '30 min',
      icon: Truck,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'rescue-04',
      name: 'Emergency Response Delta',
      type: 'Search & Rescue',
      status: 'standby',
      location: 'Chandigarh Base',
      members: 18,
      equipment: ['Drones', 'Search Equipment', 'Ropes'],
      eta: '60 min',
      icon: Users,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-blue-600 bg-blue-100';
      case 'en-route': return 'text-orange-600 bg-orange-100';
      case 'available': return 'text-green-600 bg-green-100';
      case 'standby': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Allocation</h1>
            <p className="text-gray-600">Coordinate emergency response teams and resources</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Deploy New Team
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Teams Deployed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">163</div>
              <div className="text-sm text-gray-600">Personnel Active</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">28</div>
              <div className="text-sm text-gray-600">Vehicles Active</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">8.2m</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => {
          const Icon = team.icon;
          const isSelected = selectedTeam === team.id;
          
          return (
            <div
              key={team.id}
              onClick={() => setSelectedTeam(isSelected ? null : team.id)}
              className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-6">
                {/* Team Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${team.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.type}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                    {team.status}
                  </span>
                </div>

                {/* Team Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{team.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{team.members} members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>ETA: {team.eta}</span>
                  </div>
                </div>

                {/* Equipment */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Equipment:</p>
                  <div className="flex flex-wrap gap-2">
                    {team.equipment.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Track Team
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                        Contact Team
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Allocation AI Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Resource Suggestions</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">High Priority Allocation</h4>
              <p className="text-blue-800 text-sm mt-1">
                Deploy Medical Unit Beta to Kochi flood zone. Predicted 23% increase in medical emergencies based on current conditions.
              </p>
              <button className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800">
                Implement Suggestion →
              </button>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Optimal Route Identified</h4>
              <p className="text-green-800 text-sm mt-1">
                Alternative route suggested for Supply Chain Gamma to avoid traffic congestion. ETA reduced by 15 minutes.
              </p>
              <button className="mt-2 text-green-600 text-sm font-medium hover:text-green-800">
                Update Route →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocation;