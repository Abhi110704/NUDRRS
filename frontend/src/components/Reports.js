import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Container, Avatar, Badge, Fade, Zoom, Slide, Tooltip, Fab
} from '@mui/material';
import {
  Visibility, Edit, Delete, Add, FilterList, Search, LocalHospital as Emergency, 
  LocationOn, Phone, Schedule, Security, Speed, Warning, CheckCircle
} from '@mui/icons-material';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filter, searchTerm]);

  const fetchReports = async () => {
    try {
      // Demo data for reports
      const demoReports = [
        {
          id: 1,
          user: { username: 'citizen1', first_name: 'Raj', last_name: 'Kumar' },
          disaster_type: 'FLOOD',
          priority: 'HIGH',
          status: 'PENDING',
          description: 'Heavy rainfall causing waterlogging in residential areas. Multiple families need evacuation.',
          address: 'Sector 15, Chandigarh, Punjab',
          phone_number: '+91-9876543210',
          created_at: '2025-09-03T10:30:00Z',
          ai_confidence: 0.92
        },
        {
          id: 2,
          user: { username: 'citizen2', first_name: 'Priya', last_name: 'Sharma' },
          disaster_type: 'FIRE',
          priority: 'CRITICAL',
          status: 'IN_PROGRESS',
          description: 'Factory fire spreading rapidly. Fire department on site, need additional resources.',
          address: 'Industrial Area, Gurgaon, Haryana',
          phone_number: '+91-9876543211',
          created_at: '2025-09-03T11:15:00Z',
          ai_confidence: 0.98
        },
        {
          id: 3,
          user: { username: 'citizen3', first_name: 'Amit', last_name: 'Singh' },
          disaster_type: 'EARTHQUAKE',
          priority: 'MEDIUM',
          status: 'VERIFIED',
          description: 'Minor earthquake reported, checking for structural damages in old buildings.',
          address: 'Hill Station Road, Shimla, Himachal Pradesh',
          phone_number: '+91-9876543212',
          created_at: '2025-09-03T09:45:00Z',
          ai_confidence: 0.85
        },
        {
          id: 4,
          user: { username: 'citizen4', first_name: 'Sunita', last_name: 'Devi' },
          disaster_type: 'LANDSLIDE',
          priority: 'HIGH',
          status: 'RESOLVED',
          description: 'Road blocked due to landslide. Cleared successfully, traffic restored.',
          address: 'Mountain View, Dehradun, Uttarakhand',
          phone_number: '+91-9876543213',
          created_at: '2025-09-02T16:20:00Z',
          ai_confidence: 0.89
        },
        {
          id: 5,
          user: { username: 'citizen5', first_name: 'Ravi', last_name: 'Patel' },
          disaster_type: 'CYCLONE',
          priority: 'CRITICAL',
          status: 'PENDING',
          description: 'Cyclone warning issued. Evacuation of coastal villages in progress.',
          address: 'Coastal Area, Visakhapatnam, Andhra Pradesh',
          phone_number: '+91-9876543214',
          created_at: '2025-09-03T12:00:00Z',
          ai_confidence: 0.95
        },
        {
          id: 6,
          user: { username: 'citizen1', first_name: 'Meera', last_name: 'Joshi' },
          disaster_type: 'MEDICAL',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          description: 'Medical emergency - multiple casualties from building collapse.',
          address: 'Old City, Ahmedabad, Gujarat',
          phone_number: '+91-9876543215',
          created_at: '2025-09-03T08:30:00Z',
          ai_confidence: 0.91
        }
      ];

      setReports(demoReports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;
    
    if (filter !== 'ALL') {
      filtered = filtered.filter(report => report.status === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.disaster_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredReports(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'VERIFIED': 'info',
      'IN_PROGRESS': 'primary',
      'RESOLVED': 'success',
      'FALSE_ALARM': 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': 'success',
      'MEDIUM': 'warning',
      'HIGH': 'error',
      'CRITICAL': 'error'
    };
    return colors[priority] || 'default';
  };

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
            <Emergency sx={{ fontSize: 40, color: '#ff1744', mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Emergency Reports Command Center
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Real-time disaster response management system
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              minWidth: 100,
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {filteredReports.length}
                </Typography>
                <Typography variant="caption">Total Reports</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              background: 'rgba(255, 23, 68, 0.2)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'white',
              minWidth: 100,
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {filteredReports.filter(r => r.priority === 'CRITICAL').length}
                </Typography>
                <Typography variant="caption">Critical</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Filters and Search */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search reports by location, type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filter}
                label="Filter by Status"
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <MenuItem value="ALL">🔍 All Reports</MenuItem>
                <MenuItem value="PENDING">⏳ Pending</MenuItem>
                <MenuItem value="VERIFIED">✅ Verified</MenuItem>
                <MenuItem value="IN_PROGRESS">🔄 In Progress</MenuItem>
                <MenuItem value="RESOLVED">✅ Resolved</MenuItem>
                <MenuItem value="FALSE_ALARM">❌ False Alarm</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<Add />}
              fullWidth
              sx={{ 
                height: '56px',
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                borderRadius: 2,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(238, 90, 36, 0.3)'
                }
              }}
            >
              New Emergency Report
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Advanced Filters">
              <IconButton 
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  width: 56,
                  height: 56,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <FilterList />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Reports Cards */}
      <Grid container spacing={3}>
        {filteredReports.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Emergency sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                No Emergency Reports Found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                No reports match your current search criteria
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredReports.map((report, index) => (
            <Grid item xs={12} md={6} lg={4} key={report.id}>
              <Zoom in={true} timeout={300 + index * 100}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
                  },
                  '&::before': report.priority === 'CRITICAL' ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #ff1744, #d32f2f)',
                    borderRadius: '12px 12px 0 0'
                  } : {}
                }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          background: report.priority === 'CRITICAL' 
                            ? 'linear-gradient(45deg, #ff1744, #d32f2f)'
                            : 'linear-gradient(45deg, #667eea, #764ba2)',
                          mr: 2,
                          width: 48,
                          height: 48
                        }}>
                          <Emergency />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {report.disaster_type}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Report #{report.id}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {report.priority === 'CRITICAL' && (
                        <Chip
                          label="🚨 CRITICAL"
                          size="small"
                          sx={{
                            background: 'linear-gradient(45deg, #ff1744, #d32f2f)',
                            color: 'white',
                            fontWeight: 'bold',
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                    </Box>

                    {/* Status and Priority */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={report.status}
                        size="small"
                        color={getStatusColor(report.status)}
                        icon={
                          report.status === 'RESOLVED' ? <CheckCircle /> :
                          report.status === 'IN_PROGRESS' ? <Speed /> :
                          <Schedule />
                        }
                      />
                      <Chip
                        label={report.priority}
                        size="small"
                        color={getPriorityColor(report.priority)}
                        icon={<Warning />}
                      />
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <LocationOn sx={{ color: 'primary.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                        {report.address}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" sx={{ 
                      color: '#666', 
                      mb: 2, 
                      fontStyle: 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      "{report.description}"
                    </Typography>

                    {/* Reporter Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        {report.user.first_name} {report.user.last_name}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        {report.phone_number}
                      </Typography>
                    </Box>

                    {/* AI Confidence */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          🤖 AI Confidence
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {(report.ai_confidence * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        height: 6, 
                        background: '#e0e0e0', 
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          height: '100%',
                          width: `${report.ai_confidence * 100}%`,
                          background: report.ai_confidence > 0.9 
                            ? 'linear-gradient(90deg, #4caf50, #66bb6a)'
                            : report.ai_confidence > 0.7
                            ? 'linear-gradient(90deg, #ff9800, #ffb74d)'
                            : 'linear-gradient(90deg, #f44336, #ef5350)',
                          borderRadius: 3,
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                    </Box>

                    {/* Timestamp */}
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                      📅 {new Date(report.created_at).toLocaleString()}
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            sx={{ 
                              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                              color: 'white',
                              '&:hover': { 
                                background: 'linear-gradient(45deg, #21cbf3, #2196f3)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Report">
                          <IconButton 
                            size="small"
                            sx={{ 
                              background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                              color: 'white',
                              '&:hover': { 
                                background: 'linear-gradient(45deg, #ffb74d, #ff9800)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Archive Report">
                          <IconButton 
                            size="small"
                            sx={{ 
                              background: 'linear-gradient(45deg, #f44336, #ef5350)',
                              color: 'white',
                              '&:hover': { 
                                background: 'linear-gradient(45deg, #ef5350, #f44336)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Chip
                        label={`${Math.floor((Date.now() - new Date(report.created_at)) / (1000 * 60))}m ago`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))
        )}
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
            transform: 'scale(1.1)'
          }
        }}
      >
        <Add />
      </Fab>

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

export default Reports;
