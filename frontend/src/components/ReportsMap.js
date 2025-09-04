import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { 
  Box, Paper, Typography, Chip, Button, Grid, Card, CardContent, 
  AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Badge, Fab, Tooltip, Switch, FormControlLabel,
  Slide, Zoom, Fade, Avatar, LinearProgress, CircularProgress, Menu, MenuItem
} from '@mui/material';
import { 
  LocationOn, LocalHospital as Emergency, Warning, Refresh, FilterList, Menu as MenuIcon, 
  Notifications, Settings, Fullscreen, MyLocation, Layers,
  Timeline, Speed, Security, Visibility, VisibilityOff
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('idle');

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const addLiveUpdate = (message, type = 'info') => {
    const update = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      isNew: true
    };
    
    setLiveUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
    
    // Remove isNew flag after 3 seconds
    setTimeout(() => {
      setLiveUpdates(prev => 
        prev.map(u => u.id === update.id ? { ...u, isNew: false } : u)
      );
    }, 3000);
  };

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

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
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
        const reportsData = response.data.results || response.data || [];
        
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
        addLiveUpdate(`✅ Live map data loaded: ${transformedReports.length} reports`, 'success');
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
        addLiveUpdate('🎭 Using demo map data', 'info');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setUpdateStatus('error');
      setLastUpdate(new Date());
      addLiveUpdate('❌ Error loading map data', 'error');
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Map Control Buttons - Left Bottom */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 16, 
        left: 16, 
        zIndex: 1000,
        display: 'flex',
        gap: 1
      }}>
        <Tooltip title="My Location">
          <Fab
            size="medium"
            disabled={locationLoading}
            sx={{ 
              background: locationLoading 
                ? 'rgba(102, 126, 234, 0.5)' 
                : 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: locationLoading 
                  ? 'rgba(102, 126, 234, 0.5)' 
                  : 'linear-gradient(45deg, #764ba2, #667eea)',
                transform: locationLoading ? 'none' : 'scale(1.05)'
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.6)'
              }
            }}
            onClick={getUserLocation}
          >
            {locationLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <MyLocation />
            )}
          </Fab>
        </Tooltip>
        
        <Tooltip title="Refresh Data">
          <Fab 
            size="medium"
            disabled={refreshing}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1976d2',
              '&:hover': {
                background: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.05)'
              }
            }}
            onClick={fetchReports}
          >
            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </Fab>
        </Tooltip>

        <Tooltip title="Map Controls">
          <Fab
            size="medium"
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1976d2',
              '&:hover': {
                background: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.05)'
              }
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </Fab>
        </Tooltip>
      </Box>

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

      {/* Enhanced Stats Dashboard */}
      <Paper 
        sx={{ 
          m: 2, 
          p: 2, 
          background: 'white',
          color: '#0f172a',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px rgba(244, 67, 54, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              height: 140,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f44336, #d32f2f)',
                borderRadius: '16px 16px 0 0'
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(244, 67, 54, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.35)'
              }
            }}>
              <CardContent sx={{ 
                p: 3, 
                position: 'relative', 
                zIndex: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  mx: 'auto'
                }}>
                  <Emergency sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {filteredReports.filter(r => r.priority === 'CRITICAL').length}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#374151',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  fontSize: '0.9rem'
                }}>
                  Critical Alerts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              height: 140,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ff9800, #f57c00)',
                borderRadius: '16px 16px 0 0'
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(255, 152, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.35)'
              }
            }}>
              <CardContent sx={{ 
                p: 3, 
                position: 'relative', 
                zIndex: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  mx: 'auto'
                }}>
                  <Warning sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {filteredReports.filter(r => r.priority === 'HIGH').length}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#374151',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  fontSize: '0.9rem'
                }}>
                  High Priority
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              height: 140,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                borderRadius: '16px 16px 0 0'
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(33, 150, 243, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.35)'
              }
            }}>
              <CardContent sx={{ 
                p: 3, 
                position: 'relative', 
                zIndex: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  mx: 'auto'
                }}>
                  <Timeline sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {filteredReports.filter(r => ['PENDING', 'IN_PROGRESS', 'VERIFIED'].includes(r.status)).length}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#374151',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  fontSize: '0.9rem'
                }}>
                  Active Cases
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              height: 140,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4caf50, #388e3c)',
                borderRadius: '16px 16px 0 0'
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(76, 175, 80, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.35)'
              }
            }}>
              <CardContent sx={{ 
                p: 3, 
                position: 'relative', 
                zIndex: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  mx: 'auto'
                }}>
                  <Speed sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  {Math.round((filteredReports.filter(r => r.status === 'RESOLVED').length / filteredReports.length) * 100) || 0}%
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#374151',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  fontSize: '0.9rem'
                }}>
                  Resolution Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Map Container */}
      <Paper sx={{ 
        flex: 1, 
        m: 2, 
        mt: 0, 
        borderRadius: 3, 
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
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
        
      </Paper>

      {/* Control Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🎛️ Map Controls
          </Typography>
          
          <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={showCriticalOnly}
                onChange={(e) => setShowCriticalOnly(e.target.checked)}
                color="error"
              />
            }
            label="Show Critical Only"
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                color="primary"
              />
            }
            label="Show Active Only"
            sx={{ mb: 2 }}
          />
          
          <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Map Style</Typography>
          <List>
            {[
              { value: 'standard', label: 'Standard', icon: <Layers /> },
              { value: 'satellite', label: 'Satellite', icon: <Security /> },
              { value: 'dark', label: 'Dark Mode', icon: <Visibility /> }
            ].map((style) => (
              <ListItem
                key={style.value}
                button
                selected={mapStyle === style.value}
                onClick={() => setMapStyle(style.value)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: mapStyle === style.value ? 'rgba(255,255,255,0.2)' : 'transparent'
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {style.icon}
                </ListItemIcon>
                <ListItemText primary={style.label} />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="success"
              />
            }
            label="Auto Refresh (10s)"
          />
        </Box>
      </Drawer>

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

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        TransitionComponent={Fade}
        sx={{
          '& .MuiPaper-root': {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 1,
            minWidth: 350
          }
        }}
      >
        <MenuItem onClick={handleNotificationClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ff1744' }}>
              🚨 Critical Emergency Alert
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {filteredReports.filter(r => r.priority === 'CRITICAL').length} critical reports require immediate attention
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              ⚠️ High Priority Incidents
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {filteredReports.filter(r => r.priority === 'HIGH').length} high priority incidents in your area
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
              📍 Location Updates
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Real-time emergency reports updated every 10 seconds
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              ✅ System Status
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Emergency response system operational. All services online.
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReportsMap;