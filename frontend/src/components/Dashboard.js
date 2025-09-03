import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, LinearProgress,
  Chip, IconButton, Fab, Container, Avatar, Badge, Zoom, Slide, Fade,
  Alert, CircularProgress
} from '@mui/material';
import {
  LocalHospital as Emergency, Warning, CheckCircle, Schedule, TrendingUp, 
  People, LocationOn, Refresh, Notifications, Speed, Security,
  Timeline, Assessment, Visibility, FlashOn, Report, Pending
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Try to fetch real data first, fallback to demo data
      try {
        const [statsResponse, reportsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/sos-reports/dashboard_stats/'),
          axios.get('http://127.0.0.1:8000/api/sos-reports/?limit=5')
        ]);
        
        setStats(statsResponse.data);
        setRecentReports(reportsResponse.data.results || []);
        setLoading(false);
        return;
      } catch (apiError) {
        console.log('API not available, using demo data:', apiError.message);
      }

      // Fallback to demo data
      const demoStats = {
        total_reports: 247,
        pending_reports: 23,
        active_reports: 15,
        resolved_reports: 209,
        by_disaster_type: {
          'Flood': 89,
          'Earthquake': 45,
          'Fire': 67,
          'Landslide': 28,
          'Cyclone': 18
        },
        by_priority: {
          'LOW': 98,
          'MEDIUM': 87,
          'HIGH': 45,
          'CRITICAL': 17
        }
      };

      const demoReports = [
        {
          id: 1,
          properties: {
            disaster_type: 'Flood',
            status: 'PENDING',
            priority: 'HIGH',
            address: 'Sector 15, Chandigarh, Punjab',
            description: 'Heavy rainfall causing waterlogging in residential areas. Multiple families need evacuation.',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: 2,
          properties: {
            disaster_type: 'Fire',
            status: 'IN_PROGRESS',
            priority: 'CRITICAL',
            address: 'Industrial Area, Gurgaon, Haryana',
            description: 'Factory fire spreading rapidly. Fire department on site, need additional resources.',
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          }
        },
        {
          id: 3,
          properties: {
            disaster_type: 'Earthquake',
            status: 'VERIFIED',
            priority: 'MEDIUM',
            address: 'Hill Station Road, Shimla, Himachal Pradesh',
            description: 'Minor earthquake reported, checking for structural damages in old buildings.',
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: 4,
          properties: {
            disaster_type: 'Landslide',
            status: 'RESOLVED',
            priority: 'HIGH',
            address: 'Mountain View, Dehradun, Uttarakhand',
            description: 'Road blocked due to landslide. Cleared successfully, traffic restored.',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: 5,
          properties: {
            disaster_type: 'Cyclone',
            status: 'PENDING',
            priority: 'CRITICAL',
            address: 'Coastal Area, Visakhapatnam, Andhra Pradesh',
            description: 'Cyclone warning issued. Evacuation of coastal villages in progress.',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        }
      ];

      setStats(demoStats);
      setRecentReports(demoReports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#ff9800',
      'VERIFIED': '#2196f3',
      'IN_PROGRESS': '#9c27b0',
      'RESOLVED': '#4caf50',
      'FALSE_ALARM': '#f44336'
    };
    return colors[status] || '#757575';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336',
      'CRITICAL': '#d32f2f'
    };
    return colors[priority] || '#757575';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const pieData = stats ? Object.entries(stats.by_disaster_type).map(([key, value]) => ({
    name: key,
    value: value
  })) : [];

  const barData = stats ? Object.entries(stats.by_priority).map(([key, value]) => ({
    name: key,
    value: value
  })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        p: 3,
        mb: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Typography variant="h3" gutterBottom sx={{ 
          color: 'white', 
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🚨 NUDRRS Emergency Dashboard
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          National Unified Disaster Response & Relief System
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Total Reports
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.total_reports || 0}
                  </Typography>
                </Box>
                <Report sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(255, 167, 38, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Pending
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.pending_reports || 0}
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(66, 165, 245, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Active
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.active_reports || 0}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 187, 106, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Resolved
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.resolved_reports || 0}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
              📊 Reports by Disaster Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
              📈 Reports by Priority
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
              🚨 Recent Emergency Reports
            </Typography>
            {recentReports.length === 0 ? (
              <Alert severity="info">No recent reports available</Alert>
            ) : (
              <Grid container spacing={2}>
                {recentReports.map((report) => (
                  <Grid item xs={12} md={6} key={report.id}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                      }
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="h6">
                            {report.properties.disaster_type}
                          </Typography>
                          <Box>
                            <Chip
                              label={report.properties.status}
                              size="small"
                              sx={{ 
                                backgroundColor: getStatusColor(report.properties.status),
                                color: 'white',
                                mr: 1
                              }}
                            />
                            <Chip
                              label={report.properties.priority}
                              size="small"
                              sx={{ 
                                backgroundColor: getPriorityColor(report.properties.priority),
                                color: 'white'
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {report.properties.address}
                        </Typography>
                        <Typography variant="body2">
                          {report.properties.description}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {new Date(report.properties.created_at).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
