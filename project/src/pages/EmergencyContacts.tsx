import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';

const EmergencyContacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'emergency', name: 'Emergency Services' },
    { id: 'medical', name: 'Medical' },
    { id: 'shelter', name: 'Shelters' },
    { id: 'transport', name: 'Transportation' }
  ];

  const contacts = [
    {
      id: 1,
      name: 'National Emergency Response',
      number: '108',
      category: 'emergency',
      description: '24/7 emergency medical, fire, and police services',
      location: 'Pan India',
      availability: '24/7',
      type: 'National Helpline'
    },
    {
      id: 2,
      name: 'NDRF Control Room',
      number: '011-26701728',
      category: 'emergency',
      description: 'National Disaster Response Force coordination',
      location: 'New Delhi',
      availability: '24/7',
      type: 'Disaster Response'
    },
    {
      id: 3,
      name: 'Kochi Emergency Shelter',
      number: '0484-2234567',
      category: 'shelter',
      description: 'Temporary accommodation and relief supplies',
      location: 'Kochi, Kerala',
      availability: '24/7',
      type: 'Relief Shelter'
    },
    {
      id: 4,
      name: 'Regional Medical Center',
      number: '0135-2234568',
      category: 'medical',
      description: 'Emergency medical services and trauma care',
      location: 'Dehradun, Uttarakhand',
      availability: '24/7',
      type: 'Medical Center'
    },
    {
      id: 5,
      name: 'Emergency Transport Service',
      number: '0291-2234569',
      category: 'transport',
      description: 'Evacuation vehicles and emergency transportation',
      location: 'Jodhpur, Rajasthan',
      availability: '24/7',
      type: 'Transport Service'
    },
    {
      id: 6,
      name: 'State Disaster Management',
      number: '0674-2234570',
      category: 'emergency',
      description: 'State-level disaster coordination and response',
      location: 'Bhubaneswar, Odisha',
      availability: '24/7',
      type: 'State Authority'
    }
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'medical': return 'text-green-600 bg-green-100';
      case 'shelter': return 'text-blue-600 bg-blue-100';
      case 'transport': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
            <p className="text-gray-600">Access emergency services and relief centers</p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Emergency Numbers */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white p-6">
        <h2 className="text-xl font-bold mb-4">Quick Emergency Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a href="tel:108" className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg hover:bg-opacity-30 transition-all">
            <div className="text-center">
              <Phone className="h-6 w-6 mx-auto mb-2" />
              <div className="text-xl font-bold">108</div>
              <div className="text-sm opacity-90">Emergency</div>
            </div>
          </a>
          <a href="tel:101" className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg hover:bg-opacity-30 transition-all">
            <div className="text-center">
              <Phone className="h-6 w-6 mx-auto mb-2" />
              <div className="text-xl font-bold">101</div>
              <div className="text-sm opacity-90">Fire Service</div>
            </div>
          </a>
          <a href="tel:100" className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg hover:bg-opacity-30 transition-all">
            <div className="text-center">
              <Phone className="h-6 w-6 mx-auto mb-2" />
              <div className="text-xl font-bold">100</div>
              <div className="text-sm opacity-90">Police</div>
            </div>
          </a>
          <a href="tel:102" className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg hover:bg-opacity-30 transition-all">
            <div className="text-center">
              <Phone className="h-6 w-6 mx-auto mb-2" />
              <div className="text-xl font-bold">102</div>
              <div className="text-sm opacity-90">Medical</div>
            </div>
          </a>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(contact.category)}`}>
                    {contact.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{contact.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{contact.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{contact.availability}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex items-center space-x-3">
              <a
                href={`tel:${contact.number}`}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center font-medium flex items-center justify-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call {contact.number}</span>
              </a>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">WhatsApp Helpline</h4>
            <p className="text-blue-800 text-sm mb-3">Get instant help via WhatsApp</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              Start WhatsApp Chat →
            </button>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">SMS Alerts</h4>
            <p className="text-green-800 text-sm mb-3">Subscribe to location-based alerts</p>
            <button className="text-green-600 text-sm font-medium hover:text-green-800">
              Subscribe to Alerts →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;