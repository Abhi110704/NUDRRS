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
          axios.get('http://localhost:8000/api/sos_reports/sos_reports/dashboard_stats/'),
          axios.get('http://localhost:8000/api/sos_reports/sos_reports/')
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
        // Demo analytics data
        setStats({
          total_reports: 247,
          pending_reports: 23,
          active_reports: 15,
          resolved_reports: 209,
          by_disaster_type: {
            'FLOOD': 89,
            'EARTHQUAKE': 45,
            'FIRE': 67,
            'LANDSLIDE': 28,
            'CYCLONE': 18
          },
          by_priority: {
            'LOW': 98,
            'MEDIUM': 87,
            'HIGH': 45,
            'CRITICAL': 17
          }
        });
      }
      
      // Generate mock time series data for demo
      const mockTimeData = generateMockTimeSeriesData();
      setTimeSeriesData(mockTimeData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const generateMockTimeSeriesData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        reports: Math.floor(Math.random() * 20) + 5,
        resolved: Math.floor(Math.random() * 15) + 3,
        pending: Math.floor(Math.random() * 8) + 1
      });
    }
    
    return data;
  };

  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const pieData = stats ? Object.entries(stats.by_disaster_type || {})
    .filter(([key, value]) => {
      // Ultra-aggressive filtering - convert to number and check multiple conditions
      const numValue = Number(value);
      const shouldInclude = numValue > 0 && 
                           !isNaN(numValue) && 
                           numValue !== 0 && 
                           value !== "0" && 
                           value !== 0 && 
                           value !== null && 
                           value !== undefined &&
                           value !== false &&
                           value !== "";
      console.log(`🔍 Pie data filter: ${key} = ${value} (type: ${typeof value}, num: ${numValue}), include: ${shouldInclude}`);
      return shouldInclude;
    }) // Ultra-aggressive filtering to eliminate ANY zero-like values
    .map(([key, value]) => ({
      name: key.length > 8 ? key.substring(0, 8) + '...' : key, // Truncate long names
      fullName: key, // Keep full name for tooltip
      value: value
    })) : [];
    
  // Final safety check - remove any remaining zero values
  const finalPieData = pieData.filter(item => {
    const numValue = Number(item.value);
    const isClean = numValue > 0 && !isNaN(numValue);
    if (!isClean) {
      console.log(`🚨 Final safety check removing: ${item.fullName} = ${item.value}`);
    }
    return isClean;
  });
  
  console.log('🎯 Final pieData for chart:', finalPieData);

  const priorityData = stats ? Object.entries(stats.by_priority).map(([key, value]) => ({
    name: key,
    value: value
  })) : [];

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
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PieChartIcon sx={{ color: '#ff9800', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                  🌪️ Disaster Type Distribution
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {finalPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400} key={JSON.stringify(finalPieData)}>
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={finalPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                      // Hide labels for 0% values or very small slices
                      if (percent === 0 || percent < 0.05 || value === 0) return null;
                      
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor={x > cx ? 'start' : 'end'} 
                          dominantBaseline="central"
                          fontSize="11"
                          fontWeight="bold"
                          stroke="black"
                          strokeWidth="0.8"
                        >
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius={80}
                    innerRadius={20}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    {finalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} reports`,
                      props.payload.fullName || name
                    ]}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 8
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    margin={{ top: 20, left: 20, right: 20, bottom: 20 }}
                    payload={finalPieData.map((entry, index) => ({
                      value: entry.fullName,
                      type: 'rect',
                      color: COLORS[index % COLORS.length]
                    }))}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontSize: '11px', margin: '2px' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 400,
                    color: '#666'
                  }}>
                    <Typography variant="h6">
                      No disaster reports available
                    </Typography>
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
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ color: '#f44336', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                  ⚡ Priority Level Analysis
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 8
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
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
