import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Paper,
  CircularProgress, Alert, useTheme, useMediaQuery, IconButton,
  Tooltip, Divider, LinearProgress
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Speed, Security, Warning,
  LocationOn, AccessTime, PriorityHigh, Assessment
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDemoMode } = useAuth();
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
      
      setStats(demoStats);
      setRecentReports(demoReports);
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 }
      }
    }}>
      {/* Modern Header Section */}
      <Box sx={{
        background: 'white',
        borderRadius: 3,
        p: 4,
        mb: 4,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: '#0f172a',
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}>
              Command Center
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#64748b',
              fontSize: '0.95rem'
            }}>
              Real-time emergency monitoring and response
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isDemoMode && (
              <Chip 
                label="Demo Mode" 
                size="small" 
                sx={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#059669',
                  fontWeight: 600,
                  border: '1px solid rgba(16, 185, 129, 0.2)'
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


      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <TrendingUp sx={{ fontSize: 24, color: 'white' }} />
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
                {stats?.total_reports || 0}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#374151',
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontSize: '0.9rem'
              }}>
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <TrendingDown sx={{ fontSize: 24, color: 'white' }} />
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
                {stats?.pending_reports || 0}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#374151',
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontSize: '0.9rem'
              }}>
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                border: '2px solid rgba(255, 255, 255, 0.2)'
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
                {stats?.active_reports || 0}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#374151',
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontSize: '0.9rem'
              }}>
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
              background: 'linear-gradient(90deg, #9c27b0, #7b1fa2)',
              borderRadius: '16px 16px 0 0'
            },
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Security sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                mb: 0.5,
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1
              }}>
                {stats?.resolved_reports || 0}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#374151',
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontSize: '0.9rem'
              }}>
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#0f172a', 
          mb: 2,
          fontSize: '1.1rem'
        }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/reports')}
              sx={{ 
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto'
                }}>
                  <Warning sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#0f172a',
                  mb: 0.5
                }}>
                  New Emergency
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.8rem'
                }}>
                  Report new incident
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/map')}
              sx={{ 
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto'
                }}>
                  <LocationOn sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#0f172a',
                  mb: 0.5
                }}>
                  View Map
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.8rem'
                }}>
                  Live incident map
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/analytics')}
              sx={{ 
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto'
                }}>
                  <Assessment sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#0f172a',
                  mb: 0.5
                }}>
                  Analytics
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.8rem'
                }}>
                  View detailed reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              onClick={() => navigate('/reports')}
              sx={{ 
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto'
                }}>
                  <PriorityHigh sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#0f172a',
                  mb: 0.5
                }}>
                  Priority Queue
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.8rem'
                }}>
                  Manage priorities
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

      {/* Recent Reports Section */}
      <Card sx={{ 
        background: 'white',
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
              <Warning sx={{ fontSize: 20, color: 'white' }} />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#0f172a',
              fontSize: '1.1rem',
              flexGrow: 1
            }}>
              Recent Emergency Reports
            </Typography>
            <Chip 
              label={`${recentReports.length} Active`} 
              size="small"
              sx={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#dc2626',
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            />
          </Box>

        {recentReports.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No recent reports available
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {recentReports.map((report, index) => (
              <Grid item xs={12} md={6} key={report.id}>
                <Card sx={{ 
                  height: '100%',
                  border: `2px solid ${getStatusColor(report.status || report.properties?.status)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" sx={{ mr: 1 }}>
                        {getDisasterIcon(report.disaster_type || report.properties?.disaster_type)}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                          {report.disaster_type || report.properties?.disaster_type}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Report #{report.id}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={report.status || report.properties?.status} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getStatusColor(report.status || report.properties?.status), 
                            color: 'white', 
                            mb: 1,
                            fontWeight: 'bold'
                          }}
                        />
                        <br />
                        <Chip 
                          label={report.priority || report.properties?.priority} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getPriorityColor(report.priority || report.properties?.priority), 
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                        {report.address || report.properties?.address}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {report.description || report.properties?.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(report.created_at || report.properties?.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      {(report.priority || report.properties?.priority) === 'HIGH' && (
                        <Tooltip title="High Priority Alert">
                          <PriorityHigh sx={{ color: '#f44336', fontSize: 20 }} />
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
