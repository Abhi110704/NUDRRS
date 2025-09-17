import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { 
  Box, Paper, Typography, Chip, Button, Grid, Card, CardContent, 
  Switch, FormControlLabel, LinearProgress, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Autocomplete,
  FormControl, InputLabel, Select, MenuItem, Divider, Alert, IconButton,
  Tooltip, Badge, List, ListItem, ListItemText, ListItemIcon, Accordion,
  AccordionSummary, AccordionDetails, Tabs, Tab
} from '@mui/material';
import { 
  LocationOn, LocalHospital as Emergency, Warning, Refresh, MyLocation,
  Timeline, Speed, Route, Directions, Close, Search, FilterList,
  Traffic, Weather, Info, CheckCircle, Cancel, ExpandMore, 
  Navigation, Map, RouteIcon, Terrain, WbSunny,
  Cloud, LocalFireDepartment, Flood, Landscape as Earthquake, Thunderstorm as Storm
} from '@mui/icons-material';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ReportsMap = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('idle');
  
  // Path Scanner States
  const [pathScannerOpen, setPathScannerOpen] = useState(false);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeReports, setRouteReports] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [pathScannerTab, setPathScannerTab] = useState(0);
  const [routeFilters, setRouteFilters] = useState({
    disasterTypes: [],
    priority: 'ALL',
    timeRange: '24h'
  });

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);


  const getUserLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = [latitude, longitude];
        setUserLocation(newLocation);
        setCenter(newLocation);
        setLocationLoading(false);
        
        // Show success message
        alert(`Location found! Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`);
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = 'Unable to retrieve your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        alert(errorMessage + ' Using default location (India center).');
        setCenter([20.5937, 78.9629]); // Fallback to India center
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };


  // Helper function to generate random coordinates within India
  const getRandomCoordinate = () => {
    const lat = 20.5937 + (Math.random() - 0.5) * 20; // ±10 degrees from center
    const lng = 78.9629 + (Math.random() - 0.5) * 30; // ±15 degrees from center
    return { lat, lng };
  };

  const fetchReports = async () => {
    setRefreshing(true);
    try {
      // Try real API first, fallback to demo data
      try {
        const response = await axios.get('http://localhost:8000/api/sos_reports/');
        const reportsData = Array.isArray(response.data) ? response.data : [];
        
        // Transform the data to include coordinates if not present
        const transformedReports = reportsData.map(report => ({
          ...report,
          latitude: report.latitude || (report.properties?.latitude) || getRandomCoordinate().lat,
          longitude: report.longitude || (report.properties?.longitude) || getRandomCoordinate().lng,
          disaster_type: report.disaster_type || report.properties?.disaster_type,
          status: report.status || report.properties?.status,
          priority: report.priority || report.properties?.priority,
          address: report.address || report.properties?.address,
          description: report.description || report.properties?.description,
          user: report.user || { first_name: 'Demo', last_name: 'User' },
          ai_confidence: report.ai_confidence || 0.85
        }));
        
        setReports(transformedReports);
        setUpdateStatus('success');
        setLastUpdate(new Date());
        console.log('✅ Live data loaded:', transformedReports.length, 'reports');
      } catch (apiError) {
        setUpdateStatus('error');
        setLastUpdate(new Date());
        console.log('🔄 API not available, using enhanced demo map data');
        // Enhanced demo reports with geographic coordinates for India
        const demoReports = [
          {
            id: 1,
            latitude: 28.6139, longitude: 77.2090, // Delhi
            disaster_type: 'FLOOD', priority: 'CRITICAL', status: 'PENDING',
            description: 'Severe flooding in residential areas, immediate evacuation needed',
            address: 'Yamuna Bank, New Delhi', phone_number: '+91-9876543210',
            created_at: new Date().toISOString(), ai_confidence: 0.95,
            user: { first_name: 'Rajesh', last_name: 'Kumar' }
          },
          {
            id: 2,
            latitude: 19.0760, longitude: 72.8777, // Mumbai
            disaster_type: 'FIRE', priority: 'HIGH', status: 'IN_PROGRESS',
            description: 'High-rise building fire, fire department on site',
            address: 'Bandra West, Mumbai', phone_number: '+91-9876543211',
            created_at: new Date(Date.now() - 3600000).toISOString(), ai_confidence: 0.92,
            user: { first_name: 'Priya', last_name: 'Sharma' }
          },
          {
            id: 3,
            latitude: 13.0827, longitude: 80.2707, // Chennai
            disaster_type: 'CYCLONE', priority: 'CRITICAL', status: 'VERIFIED',
            description: 'Cyclone approaching coastal areas, evacuation in progress',
            address: 'Marina Beach, Chennai', phone_number: '+91-9876543212',
            created_at: new Date(Date.now() - 7200000).toISOString(), ai_confidence: 0.98,
            user: { first_name: 'Arjun', last_name: 'Patel' }
          },
          {
            id: 4,
            latitude: 22.5726, longitude: 88.3639, // Kolkata
            disaster_type: 'EARTHQUAKE', priority: 'MEDIUM', status: 'RESOLVED',
            description: 'Minor earthquake reported, structural assessment completed',
            address: 'Park Street, Kolkata', phone_number: '+91-9876543213',
            created_at: new Date(Date.now() - 14400000).toISOString(), ai_confidence: 0.87,
            user: { first_name: 'Suresh', last_name: 'Singh' }
          },
          {
            id: 5,
            latitude: 12.9716, longitude: 77.5946, // Bangalore
            disaster_type: 'LANDSLIDE', priority: 'HIGH', status: 'PENDING',
            description: 'Landslide blocking major highway, traffic diverted',
            address: 'Electronic City, Bangalore', phone_number: '+91-9876543214',
            created_at: new Date(Date.now() - 1800000).toISOString(), ai_confidence: 0.89
          },
          {
            id: 6,
            latitude: 23.0225, longitude: 72.5714, // Ahmedabad
            disaster_type: 'MEDICAL', priority: 'CRITICAL', status: 'IN_PROGRESS',
            description: 'Mass casualty incident, multiple ambulances dispatched',
            address: 'Sabarmati, Ahmedabad', phone_number: '+91-9876543215',
            created_at: new Date(Date.now() - 900000).toISOString(), ai_confidence: 0.94
          },
          {
            id: 7,
            latitude: 26.9124, longitude: 75.7873, // Jaipur
            disaster_type: 'FIRE', priority: 'MEDIUM', status: 'RESOLVED',
            description: 'Market fire contained, no casualties reported',
            address: 'Pink City, Jaipur', phone_number: '+91-9876543216',
            created_at: new Date(Date.now() - 21600000).toISOString(), ai_confidence: 0.91
          },
          {
            id: 8,
            latitude: 30.7333, longitude: 76.7794, // Chandigarh
            disaster_type: 'FLOOD', priority: 'HIGH', status: 'PENDING',
            description: 'Heavy rainfall causing waterlogging in multiple sectors',
            address: 'Sector 17, Chandigarh', phone_number: '+91-9876543217',
            created_at: new Date(Date.now() - 3600000).toISOString(), ai_confidence: 0.93
          }
        ];
        setReports(demoReports);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setUpdateStatus('error');
      setLastUpdate(new Date());
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (showCriticalOnly && report.priority !== 'CRITICAL') return false;
    if (showActiveOnly && !['PENDING', 'IN_PROGRESS', 'VERIFIED'].includes(report.status)) return false;
    return true;
  });

  const getMapTileUrl = () => {
    const styles = {
      standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    };
    return styles[mapStyle] || styles.standard;
  };

  const getMarkerColor = (priority) => {
    const colors = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336',
      'CRITICAL': '#d32f2f'
    };
    return colors[priority] || '#757575';
  };

  const createCustomIcon = (priority, status) => {
    const color = getMarkerColor(priority);
    const isActive = ['PENDING', 'VERIFIED', 'IN_PROGRESS'].includes(status);
    const isCritical = priority === 'CRITICAL';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background: ${isCritical ? 'radial-gradient(circle, #ff1744, #d32f2f)' : `radial-gradient(circle, ${color}, ${color}dd)`};
        width: ${isCritical ? '28px' : '22px'};
        height: ${isCritical ? '28px' : '22px'};
        border-radius: 50%;
        border: 3px solid ${isCritical ? '#ffeb3b' : 'white'};
        box-shadow: 0 0 ${isCritical ? '15px' : '8px'} rgba(${isCritical ? '255, 23, 68' : '0,0,0'}, ${isCritical ? '0.6' : '0.3'});
        ${isActive ? 'animation: pulse 2s infinite;' : ''}
        ${isCritical ? 'animation: criticalPulse 1s infinite;' : ''}
        position: relative;
        z-index: ${isCritical ? '1000' : '100'};
      "></div>`,
      iconSize: [isCritical ? 28 : 22, isCritical ? 28 : 22],
      iconAnchor: [isCritical ? 14 : 11, isCritical ? 14 : 11]
    });
  };

  // Path Scanner Functions
  const handleLocationSearch = async (query, type) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      // Try OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in,us,gb,ca,au,de,fr,it,es,jp,cn,kr,sg,ae,sa,za,mx,tr,nl,br,ru&accept-language=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.map(result => ({
          label: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name,
          type: type
        }));
        setLocationSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  const handleUseCurrentLocation = (type) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = {
            label: 'Current Location',
            lat: latitude,
            lng: longitude,
            address: 'Current Location',
            type: type
          };
          
          if (type === 'from') {
            setFromLocation(location);
          } else {
            setToLocation(location);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  const calculateRoute = async () => {
    if (!fromLocation || !toLocation) return;

    setRouteLoading(true);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Route calculation timeout')), 10000); // 10 second timeout
    });

    try {
      // Race between API call and timeout
      const response = await Promise.race([
        fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248e8b3c8c4b8b84a8a8b3c8c4b8b84a8a&start=${fromLocation.lng},${fromLocation.lat}&end=${toLocation.lng},${toLocation.lat}`
        ),
        timeoutPromise
      ]);
      
      if (response.ok) {
        const data = await response.json();
        const route = data.features[0];
        
        setRouteData({
          coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
          distance: route.properties.summary.distance,
          duration: route.properties.summary.duration,
          instructions: route.properties.segments[0].steps
        });
        
        // Find reports along the route
        findReportsAlongRoute(route.geometry.coordinates);
      } else {
        throw new Error('API response not ok');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      // Fast fallback: create a simple straight line route
      const fallbackRoute = {
        coordinates: [[fromLocation.lat, fromLocation.lng], [toLocation.lat, toLocation.lng]],
        distance: calculateDistance(fromLocation.lat, fromLocation.lng, toLocation.lat, toLocation.lng),
        duration: Math.floor(calculateDistance(fromLocation.lat, fromLocation.lng, toLocation.lat, toLocation.lng) / 1000 * 60), // Rough estimate
        instructions: [
          { instruction: `Start at ${fromLocation.label}`, distance: '0 m', duration: '0 min' },
          { instruction: `Navigate to ${toLocation.label}`, distance: formatDistance(calculateDistance(fromLocation.lat, fromLocation.lng, toLocation.lat, toLocation.lng)), duration: formatDuration(Math.floor(calculateDistance(fromLocation.lat, fromLocation.lng, toLocation.lat, toLocation.lng) / 1000 * 60)) }
        ]
      };
      setRouteData(fallbackRoute);
      findReportsAlongRoute([[fromLocation.lng, fromLocation.lat], [toLocation.lng, toLocation.lat]]);
    }
    setRouteLoading(false);
  };

  const findReportsAlongRoute = (routeCoordinates) => {
    const routeReports = reports.filter(report => {
      // Only include active/pending reports, exclude resolved ones
      if (report.status === 'RESOLVED') {
        return false;
      }
      
      const reportLat = parseFloat(report.latitude);
      const reportLng = parseFloat(report.longitude);
      
      // Check if report is within 1km of the route
      return routeCoordinates.some(coord => {
        const distance = calculateDistance(reportLat, reportLng, coord[1], coord[0]);
        return distance <= 1000; // 1km buffer
      });
    });
    
    setRouteReports(routeReports);
  };



  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const getDisasterIcon = (type) => {
    const icons = {
      'FLOOD': <Flood />,
      'EARTHQUAKE': <Earthquake />,
      'FIRE': <LocalFireDepartment />,
      'STORM': <Storm />,
      'OTHER': <Warning />
    };
    return icons[type] || <Warning />;
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const exportRouteData = () => {
    if (!routeData || !fromLocation || !toLocation) {
      alert('Please calculate a route first before exporting.');
      return;
    }

    const exportData = {
      routeInfo: {
        from: {
          name: fromLocation.label,
          address: fromLocation.address,
          coordinates: { lat: fromLocation.lat, lng: fromLocation.lng }
        },
        to: {
          name: toLocation.label,
          address: toLocation.address,
          coordinates: { lat: toLocation.lat, lng: toLocation.lng }
        },
        distance: formatDistance(routeData.distance),
        duration: formatDuration(routeData.duration),
        coordinates: routeData.coordinates
      },
      reports: routeReports.map(report => ({
        id: report.id,
        disaster_type: report.disaster_type,
        priority: report.priority,
        description: report.description,
        address: report.address,
        coordinates: { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) },
        created_at: report.created_at,
        status: report.status
      })),
      exportInfo: {
        exportedAt: new Date().toISOString(),
        totalReports: routeReports.length,
        activeReports: routeReports.filter(r => r.status === 'PENDING').length,
        highPriorityReports: routeReports.filter(r => r.priority === 'HIGH').length
      }
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `route_${fromLocation.label.replace(/\s+/g, '_')}_to_${toLocation.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also create a human-readable text version
    const textContent = `
NUDRRS Route Export
==================

Route Information:
- From: ${fromLocation.label} (${fromLocation.address})
- To: ${toLocation.label} (${toLocation.address})
- Distance: ${formatDistance(routeData.distance)}
- Duration: ${formatDuration(routeData.duration)}

Emergency Reports Along Route (${routeReports.length}):
${routeReports.map((report, index) => `
${index + 1}. ${report.disaster_type} - ${report.priority} Priority
   Location: ${report.address}
   Description: ${report.description}
   Status: ${report.status}
   Reported: ${new Date(report.created_at).toLocaleString()}
`).join('')}


Export Information:
- Exported: ${new Date().toLocaleString()}
- Total Reports: ${routeReports.length}
- Active Reports: ${routeReports.filter(r => r.status === 'PENDING').length}
- High Priority: ${routeReports.filter(r => r.priority === 'HIGH').length}

Generated by NUDRRS Path Scanner
`;

    const textBlob = new Blob([textContent], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(textBlob);
    
    const textLink = document.createElement('a');
    textLink.href = textUrl;
    textLink.download = `route_${fromLocation.label.replace(/\s+/g, '_')}_to_${toLocation.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(textLink);
    textLink.click();
    document.body.removeChild(textLink);
    URL.revokeObjectURL(textUrl);

    alert('Route data exported successfully! Two files have been downloaded:\n1. JSON file with complete data\n2. Text file with human-readable summary');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Main Layout - Left Side Stats, Right Side Map */}
      <Grid container spacing={0} sx={{ flex: 1, height: '100%' }}>
        {/* Left Side - Critical Alerts and Stats */}
        <Grid item xs={12} lg={3} sx={{ p: 1.5, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1a202c', 
              mb: 1.5,
              fontSize: '1.1rem'
            }}>
              🚨 Critical Alerts
            </Typography>
          </Box>
          
          {/* Compact Stats Grid */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {/* Critical Alerts */}
            <Grid item xs={6}>
              <Card sx={{ 
                background: 'white',
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1
                  }}>
                    <Emergency sx={{ fontSize: 16, color: '#ef4444' }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#ef4444',
                    mb: 0.5,
                    fontSize: '1.5rem'
                  }}>
                    {filteredReports.filter(r => r.priority === 'CRITICAL').length}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    Critical
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* High Priority */}
            <Grid item xs={6}>
              <Card sx={{ 
                background: 'white',
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1
                  }}>
                    <Warning sx={{ fontSize: 16, color: '#f59e0b' }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#f59e0b',
                    mb: 0.5,
                    fontSize: '1.5rem'
                  }}>
                    {filteredReports.filter(r => r.priority === 'HIGH').length}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    High Priority
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Active Cases */}
            <Grid item xs={6}>
              <Card sx={{ 
                background: 'white',
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1
                  }}>
                    <Timeline sx={{ fontSize: 16, color: '#2563eb' }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#2563eb',
                    mb: 0.5,
                    fontSize: '1.5rem'
                  }}>
                    {filteredReports.filter(r => ['PENDING', 'IN_PROGRESS', 'VERIFIED'].includes(r.status)).length}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    Active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Resolution Rate */}
            <Grid item xs={6}>
              <Card sx={{ 
                background: 'white',
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1
                  }}>
                    <Speed sx={{ fontSize: 16, color: '#10b981' }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#10b981',
                    mb: 0.5,
                    fontSize: '1.5rem'
                  }}>
                    {Math.round((filteredReports.filter(r => r.status === 'RESOLVED').length / filteredReports.length) * 100) || 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    Resolved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Compact Map Controls */}
          <Card sx={{ 
            background: 'white',
            borderRadius: 1.5,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                color: '#1a202c',
                mb: 1.5,
                fontSize: '0.9rem'
              }}>
                🎛️ Controls
              </Typography>
              
              <Box sx={{ mb: 1.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showCriticalOnly}
                      onChange={(e) => setShowCriticalOnly(e.target.checked)}
                      color="error"
                      size="small"
                    />
                  }
                  label="Critical Only"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
              </Box>
              
              <Box sx={{ mb: 1.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showActiveOnly}
                      onChange={(e) => setShowActiveOnly(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label="Active Only"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      color="success"
                      size="small"
                    />
                  }
                  label="Auto Refresh"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={getUserLocation}
                  disabled={locationLoading}
                  startIcon={locationLoading ? <CircularProgress size={12} /> : <MyLocation />}
                  sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                >
                  Location
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchReports}
                  disabled={refreshing}
                  startIcon={<Refresh />}
                  sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setPathScannerOpen(true)}
                  startIcon={<Route />}
                  sx={{ 
                    fontSize: '0.75rem', 
                    minWidth: 'auto', 
                    px: 1,
                    background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #E55A2B, #E8821A)',
                    }
                  }}
                >
                  Path Scanner
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Map */}
        <Grid item xs={12} lg={9} sx={{ p: 1.5, pl: 0 }}>
          <Box sx={{ 
            height: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <MapContainer
              center={center}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url={getMapTileUrl()}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
                
              {filteredReports.map((report) => {
                  const isCritical = report.priority === 'CRITICAL';
                  const isActive = ['PENDING', 'VERIFIED', 'IN_PROGRESS'].includes(report.status);
                  
                  return (
                    <React.Fragment key={report.id}>
                      {/* Highlight circle for critical/high priority reports */}
                      {(isCritical || report.priority === 'HIGH') && (
                        <Circle
                          center={[report.latitude, report.longitude]}
                          radius={isCritical ? 8000 : 5000}
                          pathOptions={{
                            color: isCritical ? '#ff1744' : '#ff9800',
                            fillColor: isCritical ? '#ff1744' : '#ff9800',
                            fillOpacity: 0.1,
                            weight: 2,
                            dashArray: isCritical ? '5, 5' : null
                          }}
                        />
                      )}
                      
                      <Marker
                        position={[report.latitude, report.longitude]}
                        icon={createCustomIcon(report.priority, report.status)}
                      >
                        <Popup>
                          <Box sx={{ minWidth: 250 }}>
                            <Typography variant="h6" gutterBottom sx={{ 
                              color: isCritical ? '#d32f2f' : 'inherit',
                              fontWeight: isCritical ? 'bold' : 'normal'
                            }}>
                              🚨 {report.disaster_type}
                              {isCritical && ' ⚠️'}
                            </Typography>
                            
                            <Box sx={{ mb: 1 }}>
                              <Chip
                                label={report.status}
                                size="small"
                                color={report.status === 'RESOLVED' ? 'success' : 'primary'}
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={report.priority}
                                size="small"
                                color={report.priority === 'HIGH' || report.priority === 'CRITICAL' ? 'error' : 'warning'}
                              />
                              {isActive && (
                                <Chip
                                  label="🔴 LIVE"
                                  size="small"
                                  color="error"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                            
                            <Typography variant="body2" gutterBottom>
                              <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                              {report.address}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                              "{report.description}"
                            </Typography>
                            
                            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                              📅 Reported: {new Date(report.created_at).toLocaleString()}
                            </Typography>
                            
                            {report.phone_number && (
                              <Typography variant="caption" display="block" sx={{ color: 'primary.main' }}>
                                📞 Contact: {report.phone_number}
                              </Typography>
                            )}
                            
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={`🤖 AI: ${(report.ai_confidence * 100).toFixed(0)}%`}
                                size="small"
                                color={report.ai_confidence > 0.9 ? 'success' : 'warning'}
                              />
                              
                              {isCritical && (
                                <Chip
                                  label="⚡ URGENT ACTION REQUIRED"
                                  size="small"
                                  color="error"
                                  variant="filled"
                                />
                              )}
                            </Box>
                          </Box>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}
            </MapContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Loading Indicator - Top Right */}
      {refreshing && (
        <Paper sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          p: 1, 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}>
          <LinearProgress sx={{ width: 100 }} />
        </Paper>
      )}


      {/* Enhanced Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes criticalPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(255, 23, 68, 0.6);
          }
          50% {
            transform: scale(1.3);
            box-shadow: 0 0 25px rgba(255, 23, 68, 0.9);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(255, 23, 68, 0.6);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
        }
        
        .leaflet-popup-tip {
          background: white !important;
        }
        
        .leaflet-container {
          font-family: 'Roboto', sans-serif !important;
        }
      `}</style>

      {/* Path Scanner Dialog */}
      <Dialog 
        open={pathScannerOpen} 
        onClose={() => setPathScannerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Route />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Path Scanner
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton 
            onClick={() => setPathScannerOpen(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
           <Tabs 
             value={pathScannerTab} 
             onChange={(e, newValue) => setPathScannerTab(newValue)}
             sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
           >
             <Tab label="Route Planning" icon={<Directions />} />
             <Tab label="Route Reports" icon={<FilterList />} />
             <Tab label="Route Analysis" icon={<Timeline />} />
           </Tabs>

          {/* Route Planning Tab */}
          {pathScannerTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="primary" />
                    From Location
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Autocomplete
                      fullWidth
                      options={locationSuggestions}
                      value={fromLocation}
                      onChange={(event, newValue) => setFromLocation(newValue)}
                      onInputChange={(event, newInputValue) => {
                        if (newInputValue.length >= 3) {
                          handleLocationSearch(newInputValue, 'from');
                        }
                      }}
                      getOptionLabel={(option) => option.label || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Enter starting location"
                          variant="outlined"
                        />
                      )}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleUseCurrentLocation('from')}
                      startIcon={<MyLocation />}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Current
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="secondary" />
                    To Location
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Autocomplete
                      fullWidth
                      options={locationSuggestions}
                      value={toLocation}
                      onChange={(event, newValue) => setToLocation(newValue)}
                      onInputChange={(event, newInputValue) => {
                        if (newInputValue.length >= 3) {
                          handleLocationSearch(newInputValue, 'to');
                        }
                      }}
                      getOptionLabel={(option) => option.label || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Enter destination"
                          variant="outlined"
                        />
                      )}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleUseCurrentLocation('to')}
                      startIcon={<MyLocation />}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Current
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={calculateRoute}
                    disabled={!fromLocation || !toLocation || routeLoading}
                    startIcon={routeLoading ? <CircularProgress size={20} /> : <Search />}
                    sx={{
                      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #E55A2B, #E8821A)',
                      }
                    }}
                  >
                    {routeLoading ? 'Calculating Route...' : 'Find Route & Reports'}
                  </Button>
                  
                  {routeLoading && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress sx={{ mb: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                        This may take a few seconds. We're finding the best route and checking for emergency reports...
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Route Reports Tab */}
          {pathScannerTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList color="primary" />
                Active Reports Along Route
                <Badge badgeContent={routeReports.length} color="error" />
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Showing only <strong>active and pending</strong> emergency reports along your route. 
                  Resolved reports are excluded for better route planning.
                </Typography>
              </Alert>
              
              {routeReports.length > 0 ? (
                <List>
                  {routeReports.map((report, index) => (
                    <ListItem key={report.id} sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1,
                      background: report.priority === 'HIGH' ? '#fff3e0' : 'white'
                    }}>
                      <ListItemIcon>
                        {getDisasterIcon(report.disaster_type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {report.disaster_type}
                            </Typography>
                            <Chip 
                              label={report.priority} 
                              size="small" 
                              color={report.priority === 'HIGH' ? 'error' : 'warning'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {report.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.address} • {new Date(report.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No reports found along the selected route. Try a different route or check alternative paths.
                </Alert>
              )}
            </Box>
          )}

          {/* Route Analysis Tab */}
          {pathScannerTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline color="primary" />
                Route Analysis
              </Typography>
              
              {routeData ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Route Statistics
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Total Distance:</Typography>
                            <Typography sx={{ fontWeight: 600 }}>
                              {formatDistance(routeData.distance)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Estimated Time:</Typography>
                            <Typography sx={{ fontWeight: 600 }}>
                              {formatDuration(routeData.duration)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Reports Found:</Typography>
                            <Typography sx={{ fontWeight: 600, color: 'error.main' }}>
                              {routeReports.length}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Safety Analysis
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle color="success" />
                            <Typography>Route is generally safe</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning color="warning" />
                            <Typography>{routeReports.length} potential hazards detected</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info color="info" />
                            <Typography>Consider alternative routes if needed</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  Calculate a route first to see detailed analysis.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, background: '#f8f9fa' }}>
          <Button onClick={() => setPathScannerOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={exportRouteData}
            disabled={!routeData}
            startIcon={<Directions />}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #3d8b40)',
              }
            }}
          >
            Export Route
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ReportsMap;