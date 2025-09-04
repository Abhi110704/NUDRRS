import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Paper,
  CircularProgress, Alert, useTheme, useMediaQuery, IconButton,
  Tooltip, Divider, LinearProgress
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Speed, Security, Warning,
  LocationOn, AccessTime, PriorityHigh, Assessment, Phone
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDemoMode, user, isAdmin, isManager, userRole } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date()); // Track last update
  const navigate = useNavigate();
  const [updateStatus, setUpdateStatus] = useState('idle'); // Update status: idle, updating, success, error
  const [liveUpdates, setLiveUpdates] = useState([]); // Store live updates
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Live update function
  const addLiveUpdate = (message, type = 'info') => {
    const update = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      isNew: true
    };
    
    setLiveUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
    
    // Remove "new" status after 3 seconds
    setTimeout(() => {
      setLiveUpdates(prev => 
        prev.map(u => u.id === update.id ? { ...u, isNew: false } : u)
      );
    }, 3000);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!isDemoMode) {
        setUpdateStatus('updating');
        // Try to fetch real data from backend
      try {
        const [statsResponse, reportsResponse] = await Promise.all([
            axios.get(`http://localhost:8000/api/sos_reports/dashboard_stats/`),
            axios.get(`http://localhost:8000/api/sos_reports/?limit=5`)
          ]);
          
          // Transform the data to ensure proper structure
          const transformedStats = {
            total_reports: statsResponse.data.total_reports || 0,
            pending_reports: statsResponse.data.pending_reports || 0,
            active_reports: statsResponse.data.active_reports || 0,
            resolved_reports: statsResponse.data.resolved_reports || 0,
            by_disaster_type: statsResponse.data.by_disaster_type || {},
            by_priority: statsResponse.data.by_priority || {}
          };
          
          const transformedReports = (reportsResponse.data.results || reportsResponse.data || []).map(report => ({
            ...report,
            disaster_type: report.disaster_type || report.properties?.disaster_type,
            status: report.status || report.properties?.status,
            priority: report.priority || report.properties?.priority,
            address: report.address || report.properties?.address,
            description: report.description || report.properties?.description,
            user: report.user || { first_name: 'Demo', last_name: 'User' }
          }));
          
          setStats(transformedStats);
          setRecentReports(transformedReports);

          // Fetch user-specific reports if user is logged in and not admin/manager
          if (user && !isAdmin && !isManager) {
            try {
              const userReportsResponse = await axios.get(`http://localhost:8000/api/sos_reports/?user=${user.id}`);
              setUserReports(userReportsResponse.data.results || userReportsResponse.data || []);
            } catch (userReportsError) {
              console.log('Could not fetch user-specific reports:', userReportsError);
              setUserReports([]);
            }
          }

          setUpdateStatus('success');
          setLastUpdate(new Date());
          addLiveUpdate(`✅ Live data loaded: ${transformedStats.total_reports} reports`, 'success');
        setLoading(false);
        return;
      } catch (apiError) {
          console.log('Real API not available, using demo mode:', apiError.message);
          setUpdateStatus('error');
          addLiveUpdate('⚠️ Backend connection failed - using demo data', 'error');
          // Continue to demo data below
        }
      }
      
      // Demo data (different content for demo mode)
      const demoStats = isDemoMode ? {
        total_reports: 6,
        pending_reports: 2,
        active_reports: 3,
        resolved_reports: 1,
        by_disaster_type: {
          'FLOOD': 1,
          'FIRE': 1,
          'EARTHQUAKE': 1,
          'LANDSLIDE': 1,
          'CYCLONE': 1,
          'MEDICAL': 1
        },
        by_priority: {
          'HIGH': 3,
          'CRITICAL': 2,
          'MEDIUM': 1
        }
      } : {
        total_reports: 0,
        pending_reports: 0,
        active_reports: 0,
        resolved_reports: 0,
        by_disaster_type: {},
        by_priority: {}
      };
      
      const demoReports = isDemoMode ? [
        {
          id: 1,
          disaster_type: 'FLOOD',
            status: 'PENDING',
            priority: 'HIGH',
            address: 'Sector 15, Chandigarh, Punjab',
            description: 'Heavy rainfall causing waterlogging in residential areas. Multiple families need evacuation.',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          disaster_type: 'FIRE',
            status: 'IN_PROGRESS',
            priority: 'CRITICAL',
            address: 'Industrial Area, Gurgaon, Haryana',
            description: 'Factory fire spreading rapidly. Fire department on site, need additional resources.',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          disaster_type: 'EARTHQUAKE',
            status: 'VERIFIED',
            priority: 'MEDIUM',
            address: 'Hill Station Road, Shimla, Himachal Pradesh',
            description: 'Minor earthquake reported, checking for structural damages in old buildings.',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ] : [];

      // Demo user-specific reports
      const demoUserReports = isDemoMode && user ? [
        {
          id: 4,
          disaster_type: 'FLOOD',
          priority: 'HIGH',
          status: 'PENDING',
          address: 'Your Location, City',
          description: 'Your recent emergency report',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          user: { first_name: user.first_name || 'Demo', last_name: user.last_name || 'User' }
        }
      ] : [];

      setStats(demoStats);
      setRecentReports(demoReports);
      setUserReports(demoUserReports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ff9800';
      case 'VERIFIED': return '#2196f3';
      case 'IN_PROGRESS': return '#ff9800';
      case 'RESOLVED': return '#4caf50';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#f44336';
      case 'MEDIUM': return '#ff9800';
      case 'LOW': return '#4caf50';
      default: return '#757575';
    }
  };

  const getDisasterIcon = (type) => {
    switch (type) {
      case 'FLOOD': return '🌊';
      case 'EARTHQUAKE': return '🌋';
      case 'FIRE': return '🔥';
      case 'MEDICAL': return '🏥';
      default: return '🚨';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Loading Emergency Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  const pieData = stats ? Object.entries(stats.by_disaster_type).map(([key, value]) => ({
    name: key,
    value: value,
    color: key === 'FLOOD' ? '#2196f3' : key === 'EARTHQUAKE' ? '#ff9800' : key === 'FIRE' ? '#f44336' : '#4caf50'
  })) : [];

  const barData = stats ? Object.entries(stats.by_priority).map(([key, value]) => ({
    name: key,
    value: value,
    color: key === 'HIGH' ? '#f44336' : key === 'MEDIUM' ? '#ff9800' : '#4caf50'
  })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 2, md: 3 },
      background: '#f8fafc',
      minHeight: '100vh',
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 }
      }
    }}>
      {/* Professional Header Section */}
      <Box sx={{ 
        background: 'white',
        borderRadius: 2,
        p: 4,
        mb: 4,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: '#1a202c',
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}>
              National Unified Disaster Response System
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#4a5568',
              fontSize: '1rem',
              fontWeight: 500
            }}>
              Real-time coordination for emergency response across India
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              background: '#2563eb',
          color: 'white', 
              px: 3,
              py: 1.5,
              borderRadius: 2,
          textAlign: 'center',
              minWidth: 100
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                24/7
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Active Monitoring
        </Typography>
            </Box>
            
            {isDemoMode && (
              <Chip 
                label="Demo Mode" 
                size="small" 
                sx={{ 
                  background: '#fef3c7', 
                  color: '#92400e',
                  fontWeight: 600,
                  border: '1px solid #fbbf24'
                }} 
              />
            )}
            
            {!isDemoMode && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: updateStatus === 'updating' ? '#f59e0b' : 
                             updateStatus === 'success' ? '#10b981' : 
                             updateStatus === 'error' ? '#ef4444' : '#64748b',
                  animation: updateStatus === 'updating' ? 'pulse 1.5s infinite' : 'none'
                }} />
                <Typography variant="caption" sx={{ 
                  color: '#64748b',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}>
                  {updateStatus === 'updating' ? 'Updating...' :
                   updateStatus === 'success' ? 'Connected' :
                   updateStatus === 'error' ? 'Connection Error' : 'Idle'}
        </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>


      {/* Key Metrics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#1a202c', 
          mb: 3,
          fontSize: '1.25rem'
        }}>
          Key Metrics
        </Typography>
        <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              height: 120,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1a202c',
                    mb: 0.5,
                    fontSize: '2rem'
                  }}>
                    {stats?.total_reports || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#4a5568',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    Active Alerts
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#10b981',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    +12% vs last week
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Warning sx={{ fontSize: 24, color: '#ef4444' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              height: 120,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1a202c',
                    mb: 0.5,
                    fontSize: '2rem'
                  }}>
                    {stats?.resolved_reports || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#4a5568',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    People Helped
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#10b981',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    +8% vs last week
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Security sx={{ fontSize: 24, color: '#10b981' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              height: 120,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1a202c',
                    mb: 0.5,
                    fontSize: '2rem'
                  }}>
                    {stats?.active_reports || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#4a5568',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    Response Teams
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#10b981',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    100% vs last week
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Speed sx={{ fontSize: 24, color: '#10b981' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              height: 120,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1a202c',
                    mb: 0.5,
                    fontSize: '2rem'
                  }}>
                    8.2 min
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#4a5568',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    Avg Response Time
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#ef4444',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    -15% vs last week
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AccessTime sx={{ fontSize: 24, color: '#f59e0b' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#1a202c', 
          mb: 2.5,
          fontSize: '1.25rem'
        }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2.5} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/reports')}
              sx={{ 
                background: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: 120,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  mx: 'auto'
                }}>
                  <Warning sx={{ fontSize: 20, color: '#ef4444' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#1a202c',
                  mb: 0.5,
                  fontSize: '0.875rem'
                }}>
                  Report Emergency
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#4a5568',
                  fontSize: '0.75rem'
                }}>
                  Submit SOS report
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/map')}
              sx={{ 
                background: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: 120,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  mx: 'auto'
                }}>
                  <LocationOn sx={{ fontSize: 20, color: '#2563eb' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#1a202c',
                  mb: 0.5,
                  fontSize: '0.875rem'
                }}>
                  View Map
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#4a5568',
                  fontSize: '0.75rem'
                }}>
                  Live disaster tracking
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/reports')}
              sx={{ 
                background: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: 120,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  mx: 'auto'
                }}>
                  <Phone sx={{ fontSize: 20, color: '#f59e0b' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#1a202c',
                  mb: 0.5,
                  fontSize: '0.875rem'
                }}>
                  Emergency Contacts
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#4a5568',
                  fontSize: '0.75rem'
                }}>
                  Helplines & shelters
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/reports')}
              sx={{ 
                background: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: 120,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  mx: 'auto'
                }}>
                  <PriorityHigh sx={{ fontSize: 20, color: '#2563eb' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#1a202c',
                  mb: 0.5,
                  fontSize: '0.875rem'
                }}>
                  Broadcast Alert
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#4a5568',
                  fontSize: '0.75rem'
                }}>
                  Send notifications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#0f172a', 
          mb: 3,
          fontSize: '1.1rem'
        }}>
          Analytics Overview
        </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'white',
            borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Assessment sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#0f172a',
                    fontSize: '1.1rem'
                  }}>
                    Reports by Disaster Type
            </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
              </PieChart>
            </ResponsiveContainer>
              </CardContent>
            </Card>
        </Grid>

        <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'white',
            borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <TrendingUp sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#0f172a',
                    fontSize: '1.1rem'
                  }}>
                    Reports by Priority
            </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#colorGradient)"
                      radius={[4, 4, 0, 0]}
                    >
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
              </BarChart>
            </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* User Reports Section - Only show for regular users */}
      {user && !isAdmin && !isManager && userReports.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#1a202c', 
            mb: 3,
            fontSize: '1.25rem'
          }}>
            📋 Your Reports
          </Typography>
          <Grid container spacing={3}>
            {userReports.map((report) => (
              <Grid item xs={12} md={6} key={report.id}>
                <Card sx={{
                  background: 'white',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '1.5rem', mr: 1 }}>
                        {getDisasterIcon(report.disaster_type)}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: '#1a202c',
                        flex: 1
                      }}>
                        {report.disaster_type}
                      </Typography>
                      <Chip
                        label={report.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(report.status),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#4a5568',
                      mb: 1
                    }}>
                      📍 {report.address}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280',
                      mb: 2,
                      fontStyle: 'italic'
                    }}>
                      "{report.description}"
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={report.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(report.priority),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {new Date(report.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Emergency Alerts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#1a202c', 
          mb: 3,
          fontSize: '1.25rem'
        }}>
          Emergency Alerts
        </Typography>
        <Grid container spacing={3}>
          {recentReports.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                background: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                p: 4,
                textAlign: 'center'
              }}>
                <Typography variant="body1" color="textSecondary">
                  No recent emergency alerts
                </Typography>
              </Card>
            </Grid>
          ) : (
            recentReports.slice(0, 2).map((report, index) => (
              <Grid item xs={12} md={6} key={report.id}>
                <Card sx={{ 
                  background: 'white',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#fef2f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Warning sx={{ fontSize: 20, color: '#ef4444' }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: '#1a202c',
                          mb: 1,
                          fontSize: '1rem'
                        }}>
                          {report.disaster_type} Warning
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#4a5568',
                          mb: 2,
                          lineHeight: 1.5
                        }}>
                          {report.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontWeight: 500
                          }}>
                            {report.address}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#f59e0b'
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: '#6b7280',
                              fontWeight: 500
                            }}>
                              Active
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Real-time Activity Feed Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#1a202c', 
          mb: 3,
          fontSize: '1.25rem'
        }}>
          Real-time Activity Feed
        </Typography>
        <Card sx={{ 
          background: 'white',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxHeight: 300,
          overflow: 'auto'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Security sx={{ fontSize: 20, color: '#10b981' }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#1a202c',
                  mb: 1,
                  fontSize: '1rem'
                }}>
                  Rescue Operation Completed
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#4a5568',
                  mb: 1,
                  lineHeight: 1.5
                }}>
                  45 people evacuated from flood zone
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#6b7280',
                  fontWeight: 500
                }}>
                  Kochi, Kerala • 5 min ago
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Warning sx={{ fontSize: 20, color: '#ef4444' }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#1a202c',
                  mb: 1,
                  fontSize: '1rem'
                }}>
                  Medical Team Deployed
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#4a5568',
                  mb: 1,
                  lineHeight: 1.5
                }}>
                  Emergency medical assistance dispatched
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#6b7280',
                  fontWeight: 500
                }}>
                  Dehradun, Uttarakhand • 18 min ago
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

    </Box>
  );
};

export default Dashboard;
