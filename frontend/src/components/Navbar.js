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

  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/notifications/list/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      console.log('Notifications API Response:', response.data);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', error.response?.data);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'FAILED':
        return '#ff1744';
      case 'PENDING':
        return '#ff9800';
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

  const getNotificationIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'FAILED':
        return '❌';
      case 'PENDING':
        return '⏳';
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
                    src={user?.profile?.profile_image_url || null}
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      background: user?.profile?.profile_image_url 
                        ? 'transparent' 
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {!user?.profile?.profile_image_url && (user?.first_name?.[0] || user?.username?.[0] || 'U')}
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
        {loading ? (
          <MenuItem>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading notifications...
            </Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notification, index) => (
            <MenuItem key={notification.id || index} onClick={handleNotificationClose}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 'bold', 
                  color: getNotificationColor(notification.status || notification.type)
                }}>
                  {getNotificationIcon(notification.status || notification.type)} {notification.type || 'Notification'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.7rem' }}>
                  To: {notification.recipient}
                </Typography>
                {notification.created_at && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.7rem' }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </Typography>
                )}
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
