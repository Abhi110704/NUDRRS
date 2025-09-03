import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, 
  Badge, Menu, MenuItem, Chip, Fade, Slide
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dashboard, Map, Assessment, List, Notifications, AccountCircle,
  LocalHospital as Emergency, Security, Speed, Timeline, Warning
} from '@mui/icons-material';

const Navbar = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { path: '/', label: 'Command Center', icon: <Dashboard />, color: '#667eea' },
    { path: '/map', label: 'Live Map', icon: <Map />, color: '#f093fb' },
    { path: '/reports', label: 'Reports', icon: <List />, color: '#4facfe' },
    { path: '/analytics', label: 'Analytics', icon: <Assessment />, color: '#43e97b' },
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
        alert('Profile settings - Feature coming soon!');
        break;
      case 'settings':
        alert('System settings - Feature coming soon!');
        break;
      case 'logout':
        if (window.confirm('Are you sure you want to logout?')) {
          alert('Logout successful - Redirecting to login page...');
          // Add actual logout logic here
        }
        break;
      default:
        break;
    }
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        {/* Brand Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Emergency sx={{ fontSize: 32, mr: 1, color: '#ff1744' }} />
          <Box>
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              NUDRRS
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.7rem',
              letterSpacing: '0.5px'
            }}>
              National Unified Disaster Response & Relief System
            </Typography>
          </Box>
        </Box>

        {/* Live Status Indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, gap: 2 }}>
          <Chip
            icon={<Speed />}
            label="LIVE"
            size="small"
            sx={{
              background: 'linear-gradient(45deg, #ff1744, #d32f2f)',
              color: 'white',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}
          />
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}>
            {currentTime.toLocaleTimeString()}
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          {navItems.map((item, index) => (
            <Slide key={item.path} direction="down" in={true} timeout={300 + index * 100}>
              <Button
                component={Link}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                sx={{
                  position: 'relative',
                  background: location.pathname === item.path 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                  '&::before': location.pathname === item.path ? {
                    content: '""',
                    position: 'absolute',
                    bottom: -2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: 3,
                    background: item.color,
                    borderRadius: '2px 2px 0 0',
                  } : {}
                }}
              >
                {item.label}
              </Button>
            </Slide>
          ))}
        </Box>

        {/* User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={3} color="error">
            <IconButton 
              color="inherit"
              onClick={handleNotificationClick}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Notifications />
            </IconButton>
          </Badge>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              fontSize: '0.9rem'
            }}>
              A
            </Avatar>
          </IconButton>
        </Box>

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
              mt: 1
            }
          }}
        >
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
          <MenuItem onClick={handleNotificationClose}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ff1744' }}>
                🚨 Critical Alert
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Earthquake detected in Zone-A. Emergency teams dispatched.
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                ⚠️ High Priority
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Flood warning issued for coastal areas. Evacuation in progress.
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                ℹ️ Information
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                System maintenance scheduled for tonight 2:00 AM - 4:00 AM.
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </AppBar>
  );
};

export default Navbar;
