import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Container, Avatar, Badge, Fade, Zoom, Slide, Tooltip, Fab,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar
} from '@mui/material';
import {
  Visibility, Edit, Delete, Add, FilterList, Search, LocalHospital as Emergency, 
  LocationOn, Phone, Schedule, Security, Speed, Warning, CheckCircle, Close
} from '@mui/icons-material';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false); // Add live mode state
  const [lastUpdate, setLastUpdate] = useState(new Date()); // Track last update
  const [updateStatus, setUpdateStatus] = useState('idle'); // Update status: idle, updating, success, error
  const [liveUpdates, setLiveUpdates] = useState([]); // Store live updates
  
  // Modal states
  const [newReportDialog, setNewReportDialog] = useState(false);
  const [viewReportDialog, setViewReportDialog] = useState(false);
  const [editReportDialog, setEditReportDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Form states
  const [newReportForm, setNewReportForm] = useState({
    disaster_type: '',
    priority: 'MEDIUM',
    description: '',
    address: '',
    countryCode: '+91',
    phone_number: ''
  });

  // Country codes for phone numbers
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
  ];
  
  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (isLiveMode) {
      addLiveUpdate('Live mode activated - connecting to backend', 'success');
      const cleanup = startLiveUpdates();
      return cleanup;
    } else {
      addLiveUpdate('Demo mode activated - using local data', 'info');
    }
  }, [isLiveMode]);

  useEffect(() => {
    filterReports();
  }, [reports, filter, searchTerm]);

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

  // Auto-refresh function for live mode
  const startLiveUpdates = () => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        fetchReports();
        setLastUpdate(new Date());
        addLiveUpdate('Data refreshed from backend', 'success');
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  };

  // Helper function to get demo reports
  const getDemoReports = () => {
    return [
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
  };

  const fetchReports = async () => {
    try {
      let currentReports = [];
      
      if (isLiveMode) {
        setUpdateStatus('updating');
        // Try to fetch live data from backend
        try {
          const response = await axios.get('http://localhost:8000/api/sos_reports/');
          const reportsData = response.data.results || response.data || [];
          
          // Transform the data to ensure proper structure
          currentReports = reportsData.map(report => ({
            ...report,
            disaster_type: report.disaster_type || report.properties?.disaster_type,
            status: report.status || report.properties?.status,
            priority: report.priority || report.properties?.priority,
            address: report.address || report.properties?.address,
            description: report.description || report.properties?.description,
            user: report.user || { first_name: 'Demo', last_name: 'User' },
            ai_confidence: report.ai_confidence || 0.85
          }));
          
          console.log('✅ Live data loaded from backend:', currentReports);
          setUpdateStatus('success');
          addLiveUpdate(`✅ Live data loaded: ${currentReports.length} reports`, 'success');
        } catch (apiError) {
          console.log('Backend not available, falling back to demo data');
          setUpdateStatus('error');
          addLiveUpdate('⚠️ Backend connection failed - using demo data', 'error');
          // Fallback to demo data if backend is not available
          currentReports = getDemoReports();
        }
      } else {
        // Demo mode - load from localStorage or use default demo data
        const savedReports = localStorage.getItem('nudrrs_reports');
        
        if (savedReports) {
          currentReports = JSON.parse(savedReports);
          addLiveUpdate(`Loaded ${currentReports.length} reports from local storage`, 'info');
        } else {
          currentReports = getDemoReports();
          addLiveUpdate('Using default demo data', 'info');
        }
        setUpdateStatus('idle');
      }

      setReports(currentReports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setUpdateStatus('error');
      addLiveUpdate('Error loading reports', 'error');
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

  // Handler functions
  const handleNewReport = () => {
    setNewReportDialog(true);
    setNewReportForm({
      disaster_type: '',
      priority: 'MEDIUM',
      description: '',
      address: '',
      countryCode: '+91',
      phone_number: ''
    });
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewReportDialog(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    
    // Parse country code from existing phone number
    const phoneNumber = report.phone_number || '';
    const countryCodeMatch = phoneNumber.match(/^\+(\d{1,4})/);
    const countryCode = countryCodeMatch ? `+${countryCodeMatch[1]}` : '+91';
    const phoneNumberOnly = phoneNumber.replace(/^\+\d{1,4}/, '');
    
    setNewReportForm({
      disaster_type: report.disaster_type,
      priority: report.priority,
      description: report.description,
      address: report.address,
      countryCode: countryCode,
      phone_number: phoneNumberOnly
    });
    setEditReportDialog(true);
  };

  const handleDeleteReport = (report) => {
    setSelectedReport(report);
    setDeleteConfirmDialog(true);
  };

  const submitNewReport = async () => {
    const newReport = {
      id: Date.now(), // Generate unique ID
      user: { username: 'current_user', first_name: 'Current', last_name: 'User' },
      ...newReportForm,
      phone_number: `${newReportForm.countryCode}${newReportForm.phone_number}`,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ai_confidence: Math.random() * 0.3 + 0.7 // Random AI confidence between 0.7-1.0
    };

    if (isLiveMode) {
      // In live mode, try to send to backend first
      try {
        const response = await axios.post('http://localhost:8000/api/sos_reports/', newReport);
        console.log('✅ Report sent to backend:', response.data);
        // Refresh data from backend
        await fetchReports();
        setSnackbar({
          open: true,
          message: '✅ Emergency report sent to backend successfully!',
          severity: 'success'
        });
        addLiveUpdate('✅ New report added to backend', 'success');
      } catch (error) {
        console.error('Backend error, saving locally:', error);
        // Fallback to local storage
        const updatedReports = [newReport, ...reports];
        setReports(updatedReports);
        localStorage.setItem('nudrrs_reports', JSON.stringify(updatedReports));
        setSnackbar({
          open: true,
          message: '⚠️ Report saved locally (backend unavailable)',
          severity: 'warning'
        });
        addLiveUpdate('⚠️ Report saved locally - backend unavailable', 'warning');
      }
    } else {
      // Demo mode - save to local storage
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      localStorage.setItem('nudrrs_reports', JSON.stringify(updatedReports));
      setSnackbar({
        open: true,
        message: 'Emergency report created successfully!',
        severity: 'success'
      });
    }
    
    setNewReportDialog(false);
  };

  const submitEditReport = () => {
    const updatedReports = reports.map(report => 
      report.id === selectedReport.id 
        ? { ...report, ...newReportForm, phone_number: `${newReportForm.countryCode}${newReportForm.phone_number}` }
        : report
    );
    
    setReports(updatedReports);
    
    // Save to localStorage for persistence
    localStorage.setItem('nudrrs_reports', JSON.stringify(updatedReports));
    
    setEditReportDialog(false);
    setSnackbar({
      open: true,
      message: 'Report updated successfully!',
      severity: 'success'
    });
  };

  const confirmDeleteReport = () => {
    setReports(prev => prev.filter(report => report.id !== selectedReport.id));
    setDeleteConfirmDialog(false);
    setSnackbar({
      open: true,
      message: 'Report deleted successfully!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#f8fafc',
      p: 3,
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 }
      }
    }}>
      {/* Professional Header */}
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        background: 'white',
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3
            }}>
              <Emergency sx={{ fontSize: 24, color: '#ef4444' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#1a202c',
                mb: 1,
                fontSize: '1.75rem'
              }}>
                Emergency Reports Command Center
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                color: '#4a5568',
                lineHeight: 1.4,
                fontWeight: 500
              }}>
                Real-time disaster response management system
              </Typography>
              
              {/* Live Update Status */}
              {isLiveMode && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: updateStatus === 'updating' ? '#f59e0b' : 
                               updateStatus === 'success' ? '#10b981' : 
                               updateStatus === 'error' ? '#ef4444' : '#6b7280',
                    animation: updateStatus === 'updating' ? 'pulse 1.5s infinite' : 'none'
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: '#4a5568',
                    fontWeight: 600
                  }}>
                    {updateStatus === 'updating' ? 'Updating...' :
                     updateStatus === 'success' ? 'Connected' :
                     updateStatus === 'error' ? 'Connection Error' : 'Idle'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    • Last update: {lastUpdate.toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Card sx={{ 
              background: 'white', 
              border: '1px solid #e2e8f0',
              minWidth: 100,
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                  {filteredReports.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4a5568' }}>Total Reports</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              background: 'white', 
              border: '1px solid #e2e8f0',
              minWidth: 100,
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                  {filteredReports.filter(r => r.priority === 'CRITICAL').length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4a5568' }}>Critical</Typography>
              </CardContent>
            </Card>
            
            {/* Live Mode Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: 600 }}>
                {isLiveMode ? 'LIVE MODE' : 'DEMO MODE'}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setIsLiveMode(!isLiveMode);
                  // Refresh data when switching modes
                  setTimeout(() => fetchReports(), 100);
                }}
                sx={{
                  background: isLiveMode ? '#10b981' : '#f59e0b',
                  color: 'white',
                  fontWeight: 'bold',
                  minWidth: 80,
                  '&:hover': {
                    background: isLiveMode ? '#059669' : '#d97706',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {isLiveMode ? '🟢 LIVE' : '🟡 DEMO'}
              </Button>
            </Box>
            
            {/* User Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: 600 }}>
                Welcome, Admin
              </Typography>
              <Avatar sx={{ 
                bgcolor: '#ef4444', 
                width: 40, 
                height: 40,
                border: '2px solid #e2e8f0'
              }}>
                A
              </Avatar>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Live Updates Panel */}
      {isLiveMode && (
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          background: 'rgba(76, 175, 80, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(76, 175, 80, 0.3)',
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              color: '#4caf50', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              🟢 Live Updates
              <Box sx={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                background: '#4caf50',
                animation: 'pulse 1.5s infinite'
              }} />
            </Typography>
            <Typography variant="caption" sx={{ color: '#4caf50' }}>
              Auto-refresh every 30 seconds
            </Typography>
          </Box>
          
          <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
            {liveUpdates.length > 0 ? (
              liveUpdates.map((update) => (
                <Box
                  key={update.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    mb: 1,
                    background: update.isNew ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                    borderRadius: 2,
                    border: update.isNew ? '1px solid rgba(76, 175, 80, 0.4)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: update.type === 'success' ? '#4caf50' : 
                               update.type === 'error' ? '#f44336' : 
                               update.type === 'warning' ? '#ff9800' : '#2196f3'
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: '#4caf50',
                    flexGrow: 1,
                    fontWeight: update.isNew ? 'bold' : 'normal'
                  }}>
                    {update.message}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4caf50', opacity: 0.8 }}>
                    {update.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: '#4caf50', textAlign: 'center', py: 2 }}>
                Waiting for updates...
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Professional Filters and Search */}
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        background: 'white',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
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
                  background: 'white'
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
                  background: 'white'
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
              onClick={handleNewReport}
              sx={{ 
                height: '56px',
                background: '#ef4444',
                borderRadius: 2,
                fontWeight: 'bold',
                '&:hover': {
                  background: '#dc2626',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }
              }}
            >
              New Emergency Report
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Advanced Filters">
              <IconButton
                onClick={() => {
                  // Advanced filter functionality
                  setSnackbar({
                    open: true,
                    message: 'Advanced filters coming soon!',
                    severity: 'info'
                  });
                }}
                sx={{
                  height: '56px',
                  width: '56px',
                  background: '#7c3aed',
                  color: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    background: '#6d28d9',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
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
                  background: 'white',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #2563eb',
                  },
                  '&::before': report.priority === 'CRITICAL' ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: '#ef4444',
                    borderRadius: '8px 8px 0 0'
                  } : report.priority === 'HIGH' ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: '#f59e0b',
                    borderRadius: '8px 8px 0 0'
                  } : {}
                }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Enhanced Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar sx={{ 
                            background: report.priority === 'CRITICAL' 
                              ? 'linear-gradient(45deg, #ff1744, #d32f2f)'
                              : report.priority === 'HIGH'
                              ? 'linear-gradient(45deg, #ff9800, #ffb74d)'
                              : 'linear-gradient(45deg, #667eea, #764ba2)',
                            mr: 2,
                            width: 56,
                            height: 56,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                            border: '3px solid rgba(255, 255, 255, 0.8)'
                          }}>
                            <Emergency sx={{ fontSize: 28 }} />
                          </Avatar>
                          {report.priority === 'CRITICAL' && (
                            <Box sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#ff1744',
                              border: '2px solid white',
                              animation: 'pulse 1.5s infinite'
                            }} />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 'bold', 
                            color: '#2c3e50',
                            mb: 0.5,
                            background: 'linear-gradient(45deg, #2c3e50, #34495e)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {report.disaster_type}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#7f8c8d',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 1
                          }}>
                            Report #{report.id}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        {report.priority === 'CRITICAL' && (
                          <Chip
                            label="🚨 CRITICAL"
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, #ff1744, #d32f2f)',
                              color: 'white',
                              fontWeight: 'bold',
                              animation: 'pulse 2s infinite',
                              boxShadow: '0 4px 12px rgba(255, 23, 68, 0.4)'
                            }}
                          />
                        )}
                        <Chip
                          label={`${Math.floor((Date.now() - new Date(report.created_at)) / (1000 * 60))}m ago`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem',
                            borderColor: '#bdc3c7',
                            color: '#7f8c8d'
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Enhanced Status and Priority */}
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                      <Chip
                        label={report.status}
                        size="small"
                        color={getStatusColor(report.status)}
                        icon={
                          report.status === 'RESOLVED' ? <CheckCircle sx={{ fontSize: 16 }} /> :
                          report.status === 'IN_PROGRESS' ? <Speed sx={{ fontSize: 16 }} /> :
                          <Schedule sx={{ fontSize: 16 }} />
                        }
                        sx={{
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          '& .MuiChip-label': {
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }
                        }}
                      />
                      <Chip
                        label={report.priority}
                        size="small"
                        color={getPriorityColor(report.priority)}
                        icon={<Warning sx={{ fontSize: 16 }} />}
                        sx={{
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          '& .MuiChip-label': {
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }
                        }}
                      />
                    </Box>

                    {/* Enhanced Location */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      mb: 2.5,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                      borderRadius: 2,
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <LocationOn sx={{ 
                        color: '#667eea', 
                        mr: 1.5, 
                        mt: 0.5, 
                        fontSize: 22,
                        filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
                      }} />
                      <Typography variant="body2" sx={{ 
                        color: '#2c3e50', 
                        fontWeight: 600,
                        lineHeight: 1.4
                      }}>
                        {report.address}
                      </Typography>
                    </Box>

                    {/* Enhanced Description */}
                    <Box sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 249, 250, 0.8))',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      mb: 2.5
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#34495e', 
                        fontStyle: 'italic',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                        position: 'relative',
                        '&::before': {
                          content: '"💬"',
                          position: 'absolute',
                          left: -8,
                          top: -2,
                          fontSize: '1.2rem'
                        },
                        pl: 2
                      }}>
                        {report.description}
                      </Typography>
                    </Box>

                    {/* Enhanced Reporter Info */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2.5,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(102, 187, 106, 0.05))',
                      borderRadius: 2,
                      border: '1px solid rgba(76, 175, 80, 0.1)'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                        mr: 2,
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                      }}>
                        <Phone sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ 
                          color: '#2c3e50', 
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {report.user.first_name} {report.user.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#7f8c8d', 
                          display: 'block',
                          fontWeight: 500
                        }}>
                          @{report.user.username}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ 
                        color: '#27ae60',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}>
                        {report.phone_number}
                      </Typography>
                    </Box>

                    {/* Enhanced AI Confidence */}
                    <Box sx={{ 
                      mb: 2.5,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(30, 136, 229, 0.05))',
                      borderRadius: 2,
                      border: '1px solid rgba(33, 150, 243, 0.1)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ 
                          color: '#2c3e50',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          🤖 AI Confidence
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          color: report.ai_confidence > 0.9 ? '#27ae60' : 
                                 report.ai_confidence > 0.7 ? '#f39c12' : '#e74c3c'
                        }}>
                          {(report.ai_confidence * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        height: 8, 
                        background: 'rgba(0, 0, 0, 0.1)', 
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}>
                        <Box sx={{
                          height: '100%',
                          width: `${report.ai_confidence * 100}%`,
                          background: report.ai_confidence > 0.9 
                            ? 'linear-gradient(90deg, #4caf50, #66bb6a)'
                            : report.ai_confidence > 0.7
                            ? 'linear-gradient(90deg, #ff9800, #ffb74d)'
                            : 'linear-gradient(90deg, #f44336, #ef5350)',
                          borderRadius: 4,
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                          }
                        }} />
                      </Box>
                    </Box>

                    {/* Enhanced Timestamp */}
                    <Box sx={{
                      p: 1.5,
                      background: 'linear-gradient(135deg, rgba(149, 165, 166, 0.05), rgba(127, 140, 141, 0.05))',
                      borderRadius: 2,
                      border: '1px solid rgba(149, 165, 166, 0.1)',
                      mb: 2.5
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: '#7f8c8d', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: 500
                      }}>
                        📅 {new Date(report.created_at).toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Enhanced Action Buttons */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 249, 250, 0.8))',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Tooltip title="View Details" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewReport(report)}
                            sx={{ 
                              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                              color: 'white',
                              width: 36,
                              height: 36,
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                              '&:hover': { 
                                background: 'linear-gradient(45deg, #21cbf3, #2196f3)',
                                transform: 'scale(1.15) translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Report" arrow>
                          <IconButton 
                            size="small"
                            onClick={() => handleEditReport(report)}
                            sx={{ 
                              background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                              color: 'white',
                              width: 36,
                              height: 36,
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                              '&:hover': { 
                                background: 'linear-gradient(45deg, #ffb74d, #ff9800)',
                                transform: 'scale(1.15) translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Report" arrow>
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteReport(report)}
                            sx={{ 
                              background: 'linear-gradient(45deg, #f44336, #ef5350)',
                              color: 'white',
                              width: 36,
                              height: 36,
                              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                              '&:hover': { 
                                background: 'linear-gradient(45deg, #ef5350, #f44336)',
                                transform: 'scale(1.15) translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                        sx={{ 
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          borderColor: '#bdc3c7',
                          color: '#7f8c8d',
                          background: 'rgba(255, 255, 255, 0.8)'
                        }}
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
        onClick={handleNewReport}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#ef4444',
          '&:hover': {
            background: '#dc2626',
            transform: 'scale(1.05)'
          }
        }}
      >
        <Add />
      </Fab>

      {/* Enhanced New Emergency Report Dialog */}
      <Dialog 
        open={newReportDialog} 
        onClose={() => setNewReportDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              🚨
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                letterSpacing: '-0.5px',
                mb: 0.5
              }}>
                New Emergency Report
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.9,
                fontWeight: 500,
                fontSize: '1rem'
              }}>
                Report a new emergency situation
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setNewReportDialog(false)} 
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Close sx={{ fontSize: 24 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 6, 
          pt: 8,
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(255, 255, 255, 0.98))',
          position: 'relative'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600, color: '#1a202c' }}>Disaster Type</InputLabel>
                <Select
                  value={newReportForm.disaster_type}
                  label="Disaster Type"
                  onChange={(e) => setNewReportForm({...newReportForm, disaster_type: e.target.value})}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiSelect-select': {
                      color: '#1a202c',
                      fontWeight: 500,
                      padding: '16px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 'auto',
                      lineHeight: 1.5
                    },
                    '& .MuiSelect-icon': {
                      color: '#1976d2'
                    }
                  }}
                >
                  <MenuItem value="FLOOD" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🌊 Flood</MenuItem>
                  <MenuItem value="FIRE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🔥 Fire</MenuItem>
                  <MenuItem value="EARTHQUAKE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🌋 Earthquake</MenuItem>
                  <MenuItem value="LANDSLIDE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🏔️ Landslide</MenuItem>
                  <MenuItem value="CYCLONE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🌀 Cyclone</MenuItem>
                  <MenuItem value="MEDICAL" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🏥 Medical Emergency</MenuItem>
                  <MenuItem value="OTHER" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🚨 Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600, color: '#1a202c' }}>Priority Level</InputLabel>
                <Select
                  value={newReportForm.priority}
                  label="Priority Level"
                  onChange={(e) => setNewReportForm({...newReportForm, priority: e.target.value})}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiSelect-select': {
                      color: '#1a202c',
                      fontWeight: 500,
                      padding: '16px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 'auto',
                      lineHeight: 1.5
                    },
                    '& .MuiSelect-icon': {
                      color: '#1976d2'
                    }
                  }}
                >
                  <MenuItem value="LOW" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🟢 Low</MenuItem>
                  <MenuItem value="MEDIUM" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🟡 Medium</MenuItem>
                  <MenuItem value="HIGH" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🔴 High</MenuItem>
                  <MenuItem value="CRITICAL" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🚨 Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location/Address"
                value={newReportForm.address}
                onChange={(e) => setNewReportForm({...newReportForm, address: e.target.value})}
                placeholder="Enter the exact location of the emergency"
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: '#1976d2' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '16px 14px',
                      lineHeight: 1.5
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a202c',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newReportForm.description}
                onChange={(e) => setNewReportForm({...newReportForm, description: e.target.value})}
                placeholder="Describe the emergency situation in detail"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '16px 14px',
                      lineHeight: 1.5
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a202c',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newReportForm.phone_number}
                onChange={(e) => setNewReportForm({...newReportForm, phone_number: e.target.value})}
                placeholder="9876543210"
                inputProps={{
                  maxLength: 10,
                  pattern: "^[0-9]{10}$"
                }}
                helperText="Enter 10-digit phone number"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: '#1976d2' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '16px 14px',
                      lineHeight: 1.5
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a202c',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button 
            onClick={() => setNewReportDialog(false)} 
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2,
              borderWidth: 2,
              fontWeight: 'bold',
              px: 4
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitNewReport}
            variant="contained"
            size="large"
            disabled={!newReportForm.disaster_type || !newReportForm.description || !newReportForm.address}
            sx={{
              background: 'linear-gradient(135deg, #dc004e 0%, #ad1457 100%)',
              borderRadius: 2,
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #ad1457 0%, #dc004e 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(220, 0, 78, 0.3)'
              },
              '&:disabled': {
                background: 'rgba(0,0,0,0.12)',
                color: 'rgba(0,0,0,0.26)'
              }
            }}
          >
            Submit Emergency Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced View Report Dialog */}
      <Dialog 
        open={viewReportDialog} 
        onClose={() => setViewReportDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          borderRadius: '16px 16px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📋
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Emergency Report Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                View report information
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setViewReportDialog(false)} 
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, background: 'rgba(248, 250, 252, 0.95)' }}>
          {selectedReport && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 3, 
                  background: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Report ID</Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: '#4a5568', fontWeight: 500 }}>#{selectedReport.id}</Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Disaster Type</Typography>
                  <Chip 
                    label={selectedReport.disaster_type} 
                    sx={{ 
                      mb: 3,
                      background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }} 
                  />
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Priority</Typography>
                  <Chip 
                    label={selectedReport.priority} 
                    sx={{ 
                      mb: 3,
                      background: getPriorityColor(selectedReport.priority) === '#f44336' ? 'linear-gradient(135deg, #f44336, #d32f2f)' :
                                 getPriorityColor(selectedReport.priority) === '#ff9800' ? 'linear-gradient(135deg, #ff9800, #f57c00)' :
                                 'linear-gradient(135deg, #4caf50, #388e3c)',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  />
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Status</Typography>
                  <Chip 
                    label={selectedReport.status} 
                    sx={{ 
                      mb: 2,
                      background: getStatusColor(selectedReport.status) === '#ff9800' ? 'linear-gradient(135deg, #ff9800, #f57c00)' :
                                 getStatusColor(selectedReport.status) === '#2196f3' ? 'linear-gradient(135deg, #2196f3, #1976d2)' :
                                 'linear-gradient(135deg, #4caf50, #388e3c)',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 3, 
                  background: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Location</Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: '#4a5568', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, color: '#1976d2' }} />
                    {selectedReport.address}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Reporter</Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: '#4a5568', fontWeight: 500 }}>
                    {selectedReport.user.first_name} {selectedReport.user.last_name}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Contact</Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: '#4a5568', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: '#1976d2' }} />
                    {selectedReport.phone_number}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>AI Confidence</Typography>
                  <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', fontWeight: 500 }}>
                    {(selectedReport.ai_confidence * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 3, 
                  background: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Description</Typography>
                  <Typography variant="body1" sx={{ 
                    p: 3, 
                    background: 'rgba(248, 250, 252, 0.8)', 
                    borderRadius: 2,
                    fontStyle: 'italic',
                    color: '#4a5568',
                    lineHeight: 1.6,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    "{selectedReport.description}"
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 3, 
                  background: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>Timestamp</Typography>
                  <Typography variant="body1" sx={{ color: '#4a5568', fontWeight: 500 }}>
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button 
            onClick={() => setViewReportDialog(false)} 
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2,
              borderWidth: 2,
              fontWeight: 'bold',
              px: 4
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              setViewReportDialog(false);
              handleEditReport(selectedReport);
            }}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              borderRadius: 2,
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)'
              }
            }}
          >
            Edit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Edit Report Dialog */}
      <Dialog 
        open={editReportDialog} 
        onClose={() => setEditReportDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          borderRadius: '16px 16px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              ✏️
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Edit Emergency Report
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Update report information
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setEditReportDialog(false)} 
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, background: 'rgba(248, 250, 252, 0.95)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600, color: '#1a202c' }}>Disaster Type</InputLabel>
                <Select
                  value={newReportForm.disaster_type}
                  label="Disaster Type"
                  onChange={(e) => setNewReportForm({...newReportForm, disaster_type: e.target.value})}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiSelect-select': {
                      color: '#1a202c',
                      fontWeight: 500,
                      padding: '16px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 'auto',
                      lineHeight: 1.5
                    },
                    '& .MuiSelect-icon': {
                      color: '#1976d2'
                    }
                  }}
                >
                  <MenuItem value="FLOOD" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🌊 Flood</MenuItem>
                  <MenuItem value="FIRE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🔥 Fire</MenuItem>
                  <MenuItem value="EARTHQUAKE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🌋 Earthquake</MenuItem>
                  <MenuItem value="LANDSLIDE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🏔️ Landslide</MenuItem>
                  <MenuItem value="CYCLONE" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🌀 Cyclone</MenuItem>
                  <MenuItem value="MEDICAL" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🏥 Medical Emergency</MenuItem>
                  <MenuItem value="OTHER" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🚨 Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600, color: '#1a202c' }}>Priority Level</InputLabel>
                <Select
                  value={newReportForm.priority}
                  label="Priority Level"
                  onChange={(e) => setNewReportForm({...newReportForm, priority: e.target.value})}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiSelect-select': {
                      color: '#1a202c',
                      fontWeight: 500,
                      padding: '16px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 'auto',
                      lineHeight: 1.5
                    },
                    '& .MuiSelect-icon': {
                      color: '#1976d2'
                    }
                  }}
                >
                  <MenuItem value="LOW" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🟢 Low</MenuItem>
                  <MenuItem value="MEDIUM" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🟡 Medium</MenuItem>
                  <MenuItem value="HIGH" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🔴 High</MenuItem>
                  <MenuItem value="CRITICAL" sx={{ color: '#1a202c', fontWeight: 500, py: 1.5, minHeight: 'auto' }}>🚨 Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location/Address"
                value={newReportForm.address}
                onChange={(e) => setNewReportForm({...newReportForm, address: e.target.value})}
                placeholder="Enter the exact location of the emergency"
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: '#1976d2' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '16px 14px',
                      lineHeight: 1.5
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a202c',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newReportForm.description}
                onChange={(e) => setNewReportForm({...newReportForm, description: e.target.value})}
                placeholder="Describe the emergency situation in detail"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '16px 14px',
                      lineHeight: 1.5
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a202c',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newReportForm.phone_number}
                onChange={(e) => setNewReportForm({...newReportForm, phone_number: e.target.value})}
                placeholder="9876543210"
                inputProps={{
                  maxLength: 10,
                  pattern: "^[0-9]{10}$"
                }}
                helperText="Enter 10-digit phone number"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: '#1976d2' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minHeight: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '16px 14px',
                      lineHeight: 1.5
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a202c',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button 
            onClick={() => setEditReportDialog(false)} 
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2,
              borderWidth: 2,
              fontWeight: 'bold',
              px: 4
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitEditReport}
            variant="contained"
            size="large"
            disabled={!newReportForm.disaster_type || !newReportForm.description || !newReportForm.address}
            sx={{
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              borderRadius: 2,
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)'
              },
              '&:disabled': {
                background: 'rgba(0,0,0,0.12)',
                color: 'rgba(0,0,0,0.26)'
              }
            }}
          >
            Update Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmDialog} 
        onClose={() => setDeleteConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #f44336, #ef5350)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          🗑️ Delete Emergency Report
          <IconButton onClick={() => setDeleteConfirmDialog(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this emergency report?
          </Alert>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Report #{selectedReport.id} - {selectedReport.disaster_type}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This action cannot be undone. The report will be permanently removed from the system.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteConfirmDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteReport}
            variant="contained"
            color="error"
            sx={{
              background: 'linear-gradient(45deg, #f44336, #ef5350)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ef5350, #f44336)'
              }
            }}
          >
            Delete Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .card-hover-effect {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover-effect:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        
        .gradient-text {
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .status-indicator {
          position: relative;
          overflow: hidden;
        }
        
        .status-indicator::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Box>
  );
};

export default Reports;
