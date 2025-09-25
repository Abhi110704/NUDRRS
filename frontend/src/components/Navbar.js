import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, 
  Badge, Menu, MenuItem, Chip, Fade, Slide, Drawer, List as ListComponent, ListItem,
  ListItemIcon, ListItemText, useTheme, useMediaQuery, Divider
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Dashboard, Map, Assessment, List as ListIcon, Notifications, AccountCircle,
  LocalHospital as Emergency, Security, Speed, Warning,
  Menu as MenuIcon, Close, Logout, Settings, Person, ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
// import DemoToggle from './DemoToggle'; // Removed for production

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getUserLocation();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userLocation) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to a default location (Delhi, India)
          setUserLocation({
            lat: 28.6139,
            lng: 77.2090
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Fallback to a default location (Delhi, India)
      setUserLocation({
        lat: 28.6139,
        lng: 77.2090
      });
    }
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

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching notifications...');
      console.log('User location:', userLocation);
      console.log('Is authenticated:', isAuthenticated);
      
      // Only fetch if we have user location
      if (!userLocation) {
        console.log('User location not available yet');
        setNotifications([]);
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);

      // Fetch all reports to calculate distances
      const response = await axios.get(`${API_URL}/api/sos_reports/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      console.log('All Reports API Response:', response.data);
      
      // Get all reports
      const allReports = response.data.results || response.data || [];
      console.log('Total reports found:', allReports.length);
      
      // Calculate distances and sort by proximity
      const reportsWithDistance = allReports
        .filter(report => report.latitude && report.longitude) // Only reports with coordinates
        .map(report => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            parseFloat(report.latitude),
            parseFloat(report.longitude)
          );
          return {
            ...report,
            distance: distance
          };
        })
        .sort((a, b) => a.distance - b.distance) // Sort by distance (closest first)
        .slice(0, 3); // Take only the 3 closest reports
      
      console.log('Reports with distance:', reportsWithDistance);
      
      // Transform reports into notification format
      const reportNotifications = reportsWithDistance.map(report => ({
        id: report.id,
        type: 'Emergency Report',
        message: `${report.disaster_type} reported at ${report.address}`,
        status: report.status,
        priority: report.priority,
        created_at: report.created_at,
        disaster_type: report.disaster_type,
        address: report.address,
        description: report.description,
        distance: report.distance,
        formattedDistance: formatDistance(report.distance)
      }));
      
      console.log('Final notifications:', reportNotifications);
      setNotifications(reportNotifications);
    } catch (error) {
      console.error('Error fetching nearby reports:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Fallback: Show sample data for demonstration
      if (userLocation) {
        console.log('Showing fallback sample data');
        const sampleNotifications = [
          {
            id: 'sample1',
            type: 'Emergency Report',
            message: 'FLOOD reported at New Delhi, India',
            status: 'PENDING',
            priority: 'HIGH',
            created_at: new Date().toISOString(),
            disaster_type: 'FLOOD',
            address: 'New Delhi, India',
            description: 'Heavy rainfall causing flooding in residential areas',
            distance: 500,
            formattedDistance: '500m'
          },
          {
            id: 'sample2',
            type: 'Emergency Report',
            message: 'FIRE reported at Noida, Uttar Pradesh',
            status: 'ACTIVE',
            priority: 'MEDIUM',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            disaster_type: 'FIRE',
            address: 'Noida, Uttar Pradesh, India',
            description: 'Building fire reported in commercial area',
            distance: 1200,
            formattedDistance: '1.2km'
          },
          {
            id: 'sample3',
            type: 'Emergency Report',
            message: 'ACCIDENT reported at Gurgaon, Haryana',
            status: 'PENDING',
            priority: 'LOW',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            disaster_type: 'ACCIDENT',
            address: 'Gurgaon, Haryana, India',
            description: 'Vehicle accident on highway',
            distance: 2500,
            formattedDistance: '2.5km'
          }
        ];
        setNotifications(sampleNotifications);
      } else {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getNotificationColor = (status, priority) => {
    // Handle report priorities first
    if (priority) {
      switch (priority?.toUpperCase()) {
        case 'HIGH':
          return '#ff1744';
        case 'MEDIUM':
          return '#ff9800';
        case 'LOW':
          return '#4caf50';
        default:
          return '#2196f3';
      }
    }
    
    // Handle report statuses
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ff9800';
      case 'ACTIVE':
        return '#ff1744';
      case 'RESOLVED':
        return '#4caf50';
      case 'FAILED':
        return '#ff1744';
      case 'SENT':
      case 'DELIVERED':
        return '#4caf50';
      case 'SMS':
        return '#2196f3';
      case 'EMAIL':
        return '#9c27b0';
      case 'PUSH':
        return '#ff5722';
      case 'WHATSAPP':
        return '#25d366';
      default:
        return '#2196f3';
    }
  };

  const getNotificationIcon = (status, disasterType) => {
    // Handle disaster types first
    if (disasterType) {
      switch (disasterType?.toUpperCase()) {
        case 'EARTHQUAKE':
          return '🌍';
        case 'FLOOD':
          return '🌊';
        case 'FIRE':
          return '🔥';
        case 'STORM':
          return '⛈️';
        case 'LANDSLIDE':
          return '🏔️';
        case 'CYCLONE':
          return '🌀';
        case 'DROUGHT':
          return '☀️';
        case 'PANDEMIC':
          return '🦠';
        case 'ACCIDENT':
          return '🚨';
        case 'OTHER':
          return '⚠️';
        default:
          return '🚨';
      }
    }
    
    // Handle statuses
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '⏳';
      case 'ACTIVE':
        return '🚨';
      case 'RESOLVED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'SENT':
        return '✅';
      case 'DELIVERED':
        return '📨';
      case 'SMS':
        return '📱';
      case 'EMAIL':
        return '📧';
      case 'PUSH':
        return '🔔';
      case 'WHATSAPP':
        return '💬';
      default:
        return '📢';
    }
  };

  const navItems = [
    { path: '/', label: 'Command Center', icon: <Dashboard />, color: '#667eea' },
    { path: '/map', label: 'Live Map', icon: <Map />, color: '#f093fb' },
    { path: '/reports', label: 'Reports', icon: <ListIcon />, color: '#4facfe' },
    { path: '/analytics', label: 'Analytics', icon: <Assessment />, color: '#43e97b' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: <Security />, color: '#ff6b6b' }] : []),
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfileAction = (action) => {
    handleMenuClose();
    switch(action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        if (window.confirm('Are you sure you want to logout?')) {
          logout();
          navigate('/login');
        }
        break;
      default:
        break;
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
            <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 0,
          minHeight: 64,
          '& .MuiAppBar-root': { 
            borderRadius: 0 
          }
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }}>
          {/* Modern Brand Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <Emergency sx={{ 
                fontSize: 20, 
                color: 'white'
              }} />
            </Box>
            <Box>
              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 700, 
                color: '#1a202c',
                mb: 0,
                fontSize: '1.25rem'
              }}>
                NUDRRS National Disaster Response
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#4a5568',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                Emergency Response System
              </Typography>
            </Box>
          </Box>

          {/* Demo Toggle - Only show when authenticated */}
          {/* Demo toggle removed for production */}

          {/* Compact Status */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2, gap: 1 }}>
            <Chip
              label="LIVE"
              size="small"
              sx={{
                background: '#4caf50',
                color: 'white',
                fontWeight: 'bold',
                height: 24,
                fontSize: '0.7rem'
              }}
            />
            <Typography variant="caption" sx={{ 
              color: '#64748b',
              fontFamily: 'monospace',
              fontSize: '0.7rem'
            }}>
              {currentTime.toLocaleTimeString()}
            </Typography>
          </Box>

          {/* Modern Navigation Items - Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 3 }}>
              {navItems.map((item, index) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    position: 'relative',
                    background: location.pathname === item.path 
                      ? '#2563eb' 
                      : 'transparent',
                    color: location.pathname === item.path ? 'white' : '#4a5568',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    minWidth: 'auto',
                    transition: 'all 0.2s ease',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: location.pathname === item.path 
                        ? '#1d4ed8' 
                        : 'rgba(37, 99, 235, 0.1)',
                      color: location.pathname === item.path ? 'white' : '#2563eb',
                      transform: 'translateY(-1px)',
                    },
                    '& .MuiButton-startIcon': {
                      marginRight: 1,
                      '& svg': {
                        fontSize: '1.1rem'
                      }
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Modern User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>

                <Badge 
                  badgeContent={notifications.length} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(45deg, #ff1744, #d32f2f)',
                      boxShadow: '0 2px 8px rgba(255, 23, 68, 0.4)',
                      animation: 'pulse 2s infinite'
                    }
                  }}
                >
                  <IconButton 
                    onClick={handleNotificationClick}
                    sx={{
                      background: 'rgba(37, 99, 235, 0.1)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      borderRadius: 2,
                      width: 36,
                      height: 36,
                      color: '#2563eb',
                      '&:hover': {
                        background: 'rgba(37, 99, 235, 0.2)',
                        transform: 'scale(1.05)',
                        border: '1px solid rgba(37, 99, 235, 0.3)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Notifications sx={{ fontSize: 18 }} />
                  </IconButton>
                </Badge>
                
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    background: 'rgba(37, 99, 235, 0.1)',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    borderRadius: 2,
                    width: 36,
                    height: 36,
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.2)',
                      transform: 'scale(1.05)',
                      border: '1px solid rgba(37, 99, 235, 0.3)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Avatar 
                    src={user?.profile_image_url || null}
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      background: user?.profile_image_url 
                        ? 'transparent' 
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {!user?.profile_image_url && (user?.first_name?.[0] || user?.username?.[0] || 'U')}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={handleLoginClick}
                startIcon={<ExitToApp />}
                sx={{
                  borderColor: 'rgba(37, 99, 235, 0.3)',
                  color: '#2563eb',
                  background: 'rgba(37, 99, 235, 0.05)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'rgba(37, 99, 235, 0.5)',
                    background: 'rgba(37, 99, 235, 0.1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Login
              </Button>
            )}

            {/* Enhanced Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  borderRadius: 2,
                  width: 36,
                  height: 36,
                  ml: 1,
                  color: '#2563eb',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.2)',
                    transform: 'scale(1.05)',
                    border: '1px solid rgba(37, 99, 235, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <MenuIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
              Menu
            </Typography>
            <IconButton onClick={handleMobileMenuToggle}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            borderRadius: 2,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 'bold', 
              color: '#667eea',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              🏆 Team Hacker X Hacker
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              display: 'block'
            }}>
              Abhiyanshu Anand, Sanskar Singh, Shabin S, Krarti Bajpai, Himani Garg, Ankit Singh
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#667eea',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              display: 'block',
              mt: 0.5
            }}>
              SIH 2025
            </Typography>
          </Box>
        </Box>

        <ListComponent sx={{ pt: 1 }}>
          {navItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => handleMobileNavClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </ListComponent>

        {isAuthenticated && (
          <>
            <Divider sx={{ my: 2 }} />
            {/* Demo toggle removed for production */}
            <ListComponent>
              <ListItem button onClick={() => handleProfileAction('profile')}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={() => handleProfileAction('settings')}>
                <ListItemIcon><Settings /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>
              <ListItem button onClick={() => handleProfileAction('logout')}>
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </ListComponent>
          </>
        )}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        sx={{
          '& .MuiPaper-root': {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 1,
            minWidth: 200
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {user?.profile?.role || 'User'}
          </Typography>
          <Box sx={{ 
            p: 1.5, 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            borderRadius: 1,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <Typography variant="caption" sx={{ 
              fontWeight: 'bold', 
              color: '#667eea',
              display: 'block',
              mb: 0.5
            }}>
              🏆 Team Hacker X Hacker
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '0.7rem',
              lineHeight: 1.4,
              display: 'block'
            }}>
              Abhiyanshu Anand, Sanskar Singh, Shabin S, Krarti Bajpai, Himani Garg, Ankit Singh
            </Typography>
          </Box>
        </Box>
        <MenuItem onClick={() => handleProfileAction('profile')}>
          <AccountCircle sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <MenuItem onClick={() => handleProfileAction('settings')}>
          <Security sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem onClick={() => handleProfileAction('logout')}>
          <Warning sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

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
            minWidth: 300
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
            Nearby Emergency Reports
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            3 closest reports to your location
          </Typography>
        </Box>
        {loading ? (
          <MenuItem>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading nearby reports...
            </Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {userLocation ? 'No nearby reports found' : 'Getting your location...'}
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem key={notification.id || index} onClick={handleNotificationClose}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 'bold', 
                    color: getNotificationColor(notification.status, notification.priority)
                  }}>
                    {getNotificationIcon(notification.status, notification.disaster_type)} {notification.disaster_type}
                  </Typography>
                  <Chip 
                    label={notification.priority} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.65rem',
                      backgroundColor: getNotificationColor(notification.status, notification.priority),
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Chip 
                    label={notification.formattedDistance} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      height: 20, 
                      fontSize: '0.65rem',
                      borderColor: '#2563eb',
                      color: '#2563eb',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  {notification.address}
                </Typography>
                {notification.description && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.75rem' }}>
                    {notification.description.length > 60 
                      ? `${notification.description.substring(0, 60)}...` 
                      : notification.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={notification.status} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      height: 18, 
                      fontSize: '0.6rem',
                      borderColor: getNotificationColor(notification.status, notification.priority),
                      color: getNotificationColor(notification.status, notification.priority)
                    }} 
                  />
                  {notification.created_at && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      {new Date(notification.created_at).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
