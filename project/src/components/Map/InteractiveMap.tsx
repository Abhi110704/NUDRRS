import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapData {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  type: 'sos' | 'disaster' | 'resource';
  status: string;
}

const InteractiveMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockData: MapData[] = [
        {
          id: 1,
          latitude: 28.6139,
          longitude: 77.2090,
          title: 'Medical Emergency',
          description: 'Person injured in accident',
          type: 'sos',
          status: 'pending'
        },
        {
          id: 2,
          latitude: 28.6140,
          longitude: 77.2091,
          title: 'Flood Alert',
          description: 'Heavy rainfall causing flooding',
          type: 'disaster',
          status: 'active'
        },
        {
          id: 3,
          latitude: 28.6141,
          longitude: 77.2092,
          title: 'Ambulance Unit',
          description: 'Available for emergency response',
          type: 'resource',
          status: 'available'
        }
      ];
      
      setMapData(mockData);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'sos':
        return 'red';
      case 'disaster':
        return 'orange';
      case 'resource':
        return 'green';
      default:
        return 'blue';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[28.6139, 77.2090]} // Delhi coordinates
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {mapData.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'sos' ? 'bg-red-100 text-red-800' :
                    item.type === 'disaster' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;