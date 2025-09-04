import React, { useState } from 'react';
import InteractiveMap from '../components/Map/InteractiveMap';
import { 
  Layers, 
  Filter, 
  Search,
  AlertTriangle,
  Users,
  MapPin,
  Zap
} from 'lucide-react';

const DisasterMap: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const disasters = [
    { id: 1, type: 'flood', location: 'Kochi', lat: 9.9312, lng: 76.2673, severity: 'high', affected: 15000 },
    { id: 2, type: 'earthquake', location: 'Dehradun', lat: 30.3165, lng: 78.0322, severity: 'medium', affected: 8500 },
    { id: 3, type: 'cyclone', location: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, severity: 'high', affected: 25000 },
    { id: 4, type: 'heat', location: 'Jodhpur', lat: 26.2389, lng: 73.0243, severity: 'medium', affected: 12000 }
  ];

  const layers = [
    { id: 'all', name: 'All Disasters', color: 'bg-gray-600' },
    { id: 'flood', name: 'Flood Zones', color: 'bg-blue-600' },
    { id: 'fire', name: 'Fire Areas', color: 'bg-red-600' },
    { id: 'earthquake', name: 'Seismic Activity', color: 'bg-orange-600' },
    { id: 'weather', name: 'Severe Weather', color: 'bg-purple-600' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Disaster Map</h1>
            <p className="text-gray-600">Real-time tracking of disasters across India</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search location..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Layer Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    activeLayer === layer.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                  <span className="text-sm font-medium">{layer.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Severity Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm text-gray-700">High Risk</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-sm text-gray-700">Medium Risk</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-sm text-gray-700">Low Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Map Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Interactive Disaster Map</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4" />
                  <span>Live Data</span>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <InteractiveMap />
          </div>

          {/* Active Incidents List */}
        </div>
      </div>
    </div>
  );
};

export default DisasterMap;