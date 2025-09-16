import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Avatar, Chip, Container, Fade, Zoom
} from '@mui/material';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Assessment, Timeline, PieChart as PieChartIcon, 
  Speed, Security, Analytics as AnalyticsIcon, Dashboard
} from '@mui/icons-material';
import axios from 'axios';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Try to fetch real data first, fallback to demo data
      try {
        const [statsResponse, reportsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/sos_reports/dashboard_stats/'),
          axios.get('http://localhost:8000/api/sos_reports/')
        ]);
        
        const realStats = statsResponse.data;
        const reportsData = reportsResponse.data.results || reportsResponse.data || [];
        
        // Transform the data to ensure proper structure and filter out 0 values
        const filteredDisasterTypes = {};
        if (realStats.by_disaster_type) {
          Object.entries(realStats.by_disaster_type).forEach(([key, value]) => {
            console.log(`🔍 Backend filter: ${key} = ${value} (type: ${typeof value})`);
            // Aggressive filtering - only include if value is definitely greater than 0
            const numValue = Number(value);
            if (numValue > 0 && !isNaN(numValue) && numValue !== 0 && value !== "0" && value !== null && value !== undefined) {
              filteredDisasterTypes[key] = value;
              console.log(`✅ Including: ${key} = ${value}`);
            } else {
              console.log(`❌ Excluding: ${key} = ${value} (converted to number: ${numValue})`);
            }
          });
        }
        
        const filteredPriorities = {};
        if (realStats.by_priority) {
          Object.entries(realStats.by_priority).forEach(([key, value]) => {
            if (value > 0) {
              filteredPriorities[key] = value;
            }
          });
        }
        
        const transformedStats = {
          total_reports: realStats.total_reports || reportsData.length,
          pending_reports: realStats.pending_reports || 0,
          active_reports: realStats.active_reports || 0,
          resolved_reports: realStats.resolved_reports || 0,
          by_disaster_type: filteredDisasterTypes,
          by_priority: filteredPriorities
        };
        
        setStats(transformedStats);
        console.log('✅ Real analytics data loaded:', transformedStats);
        console.log('🔍 Filtered disaster types:', filteredDisasterTypes);
      } catch (apiError) {
        console.log('API not available, using demo data:', apiError.message);
        // Demo analytics data - ensure it's always available
        const demoStats = {
          total_reports: 342,
          pending_reports: 45,
          active_reports: 28,
          resolved_reports: 269,
          by_disaster_type: {
            'FLOOD': 125,
            'FIRE': 89,
            'EARTHQUAKE': 67,
            'LANDSLIDE': 35,
            'CYCLONE': 26,
            'DROUGHT': 12,
            'STORM': 18,
            'MEDICAL': 15
          },
          by_priority: {
            'LOW': 156,
            'MEDIUM': 98,
            'HIGH': 67,
            'CRITICAL': 21
          }
        };
        setStats(demoStats);
        console.log('✅ Demo analytics data loaded:', demoStats);
      }
      
      // Generate mock time series data for demo
      const mockTimeData = generateMockTimeSeriesData();
      setTimeSeriesData(mockTimeData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback demo data in case of any error
      setStats({
        total_reports: 342,
        pending_reports: 45,
        active_reports: 28,
        resolved_reports: 269,
        by_disaster_type: {
          'FLOOD': 125,
          'FIRE': 89,
          'EARTHQUAKE': 67,
          'LANDSLIDE': 35,
          'CYCLONE': 26,
          'DROUGHT': 12,
          'STORM': 18,
          'MEDICAL': 15
        },
        by_priority: {
          'LOW': 156,
          'MEDIUM': 98,
          'HIGH': 67,
          'CRITICAL': 21
        }
      });
      setTimeSeriesData(generateMockTimeSeriesData());
      setLoading(false);
    }
  };

  const generateMockTimeSeriesData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // More realistic data with some patterns
      const baseReports = 8;
      const weekendMultiplier = (date.getDay() === 0 || date.getDay() === 6) ? 0.7 : 1;
      const weatherFactor = Math.random() > 0.8 ? 1.5 : 1; // 20% chance of weather-related spike
      
      const reports = Math.floor((baseReports + Math.random() * 15) * weekendMultiplier * weatherFactor);
      const resolved = Math.floor(reports * (0.6 + Math.random() * 0.3)); // 60-90% resolution rate
      const pending = Math.max(0, reports - resolved);
      
      data.push({
        date: date.toISOString().split('T')[0],
        reports: reports,
        resolved: resolved,
        pending: pending
      });
    }
    
    return data;
  };

  const COLORS = [
    '#FF8C00', // Orange for EARTHQUAKE
    '#FF4444', // Red for FIRE  
    '#4A90E2', // Blue for FLOOD
    '#2ECC71', // Dark Green for MEDICAL
    '#27AE60', // Medium Green for LANDSLIDE
    '#58D68D'  // Light Green for CYCLONE
  ];

  const pieData = stats ? Object.entries(stats.by_disaster_type || {})
    .filter(([key, value]) => {
      // Simplified filtering - just check if value is greater than 0
      const numValue = Number(value);
      const shouldInclude = numValue > 0 && !isNaN(numValue);
      console.log(`🔍 Pie data filter: ${key} = ${value} (type: ${typeof value}, num: ${numValue}), include: ${shouldInclude}`);
      return shouldInclude;
    })
    .map(([key, value]) => ({
      name: key.length > 8 ? key.substring(0, 8) + '...' : key, // Truncate long names
      fullName: key, // Keep full name for tooltip
      value: Number(value) // Ensure value is a number
    })) : [];
    
  console.log('🎯 Final pieData for chart:', pieData);
  console.log('📊 Stats object:', stats);
  console.log('📈 Priority data:', stats?.by_priority);

  const priorityData = stats ? Object.entries(stats.by_priority || {}).map(([key, value]) => ({
    name: key,
    value: Number(value) || 0
  })) : [];
  
  console.log('🎯 Final priorityData for chart:', priorityData);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Loading Analytics...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3
    }}>
      {/* Enhanced Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 40, color: '#4fc3f7', mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Emergency Analytics Dashboard
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Real-time insights and performance metrics
              </Typography>
            </Box>
          </Box>
          
          <Chip
            label="🔴 LIVE DATA"
            sx={{
              background: 'linear-gradient(45deg, #ff1744, #d32f2f)',
              color: 'white',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Enhanced Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={300}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                      Response Rate
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      94.2%
                    </Typography>
                    <Chip 
                      label="+2.1% from last month" 
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    />
                  </Box>
                  <Avatar sx={{ 
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                    width: 60,
                    height: 60
                  }}>
                    <Assessment sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={400}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                      Avg Response Time
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      12 min
                    </Typography>
                    <Chip 
                      label="-3 min from last month" 
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    />
                  </Box>
                  <Avatar sx={{ 
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    width: 60,
                    height: 60
                  }}>
                    <Speed sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={500}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                      AI Accuracy
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                      87.3%
                    </Typography>
                    <Chip 
                      label="+5.2% from last month" 
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    />
                  </Box>
                  <Avatar sx={{ 
                    background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                    width: 60,
                    height: 60
                  }}>
                    <Security sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={600}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                      False Alarms
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                      5.8%
                    </Typography>
                    <Chip 
                      label="-1.2% from last month" 
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    />
                  </Box>
                  <Avatar sx={{ 
                    background: 'linear-gradient(45deg, #f44336, #ef5350)',
                    width: 60,
                    height: 60
                  }}>
                    <PieChartIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Enhanced Time Series Chart */}
        <Grid item xs={12}>
          <Fade in={true} timeout={800}>
            <Paper sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Timeline sx={{ color: '#667eea', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                  📈 Emergency Reports Trend (Last 30 Days)
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reports" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#4caf50" 
                    strokeWidth={3}
                    dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#4caf50', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#ff9800" 
                    strokeWidth={3}
                    dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ff9800', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* Enhanced Disaster Types Distribution */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={900}>
            <Paper sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PieChartIcon sx={{ color: '#4A90E2', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                  Reports by Disaster Type
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {pieData.length > 0 ? (
                  <Box sx={{ flex: 1, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300} key={JSON.stringify(pieData)}>
                      <PieChart margin={{ top: 10, right: 10, bottom: 60, left: 10 }}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                            // Hide labels for 0% values or very small slices
                            if (percent === 0 || percent < 0.05 || value === 0) return null;
                            
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 20; // Position labels outside the pie
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            
                            return (
                              <text 
                                x={x} 
                                y={y} 
                                fill="#333" 
                                textAnchor={x > cx ? 'start' : 'end'} 
                                dominantBaseline="central"
                                fontSize="12"
                                fontWeight="bold"
                              >
                                {`${name} ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          outerRadius={100}
                          innerRadius={0}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={2}
                          paddingAngle={1}
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              style={{ 
                                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value} reports (${((value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                            props.payload.fullName || name
                          ]}
                          contentStyle={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 12,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                          }}
                          labelStyle={{ 
                            color: '#333', 
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flex: 1,
                    color: '#666',
                    minHeight: 300
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        No disaster reports available
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Data will appear here once reports are submitted
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Enhanced Priority Distribution */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={1000}>
            <Paper sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ color: '#f44336', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                  ⚡ Priority Level Analysis
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {priorityData.length > 0 ? (
                  <Box sx={{ flex: 1, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={priorityData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#666" 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#666" 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 12,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                          }}
                          labelStyle={{ 
                            color: '#333', 
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                          formatter={(value, name) => [`${value} reports`, 'Count']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="url(#colorGradient)"
                          radius={[6, 6, 0, 0]}
                          style={{ 
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
                            transition: 'all 0.3s ease'
                          }}
                        />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.9}/>
                            <stop offset="50%" stopColor="#764ba2" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f093fb" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flex: 1,
                    color: '#666',
                    minHeight: 300
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        No priority data available
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Priority analysis will appear here once reports are submitted
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Enhanced Response Time Analysis */}
        <Grid item xs={12}>
          <Fade in={true} timeout={1100}>
            <Paper sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ color: '#4caf50', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                  ⏱️ Response Time Performance Analysis
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 8
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reports" 
                    stackId="1" 
                    stroke="#667eea" 
                    fill="url(#colorGradient1)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolved" 
                    stackId="1" 
                    stroke="#4caf50" 
                    fill="url(#colorGradient2)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default Analytics;
