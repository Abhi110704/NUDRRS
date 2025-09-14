import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, CardMedia,
  Chip, IconButton, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Container, Avatar, Badge, Tooltip, Fab, Divider, List, ListItem, ListItemText, ListItemAvatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Rating, LinearProgress,
  CardActions, CardHeader, Stack, ToggleButton, ToggleButtonGroup, ImageList, ImageListItem,
  Modal, Backdrop, Fade, Zoom, Slide, Collapse
} from '@mui/material';
import {
  Visibility, Edit, Delete, Add, FilterList, Search, LocalHospital as Emergency, 
  LocationOn, Phone, Schedule, Security, Speed, Warning, CheckCircle, Close,
  CloudUpload, Image as ImageIcon, Delete as DeleteIcon, AutoAwesome, Comment, 
  ThumbUp, ThumbDown, Share, Bookmark, BookmarkBorder, Person, AccessTime,
  PriorityHigh, CrisisAlert, Fireplace, Water, Terrain, LocalFireDepartment,
  MedicalServices, DirectionsCar, MoreVert, ExpandMore, ExpandLess, HowToVote,
  CheckCircleOutline, CancelOutlined, ReportProblem, PhotoCamera, AttachFile,
  PlayArrow, Fullscreen, ZoomIn, Favorite, FavoriteBorder, TrendingUp, 
  People, Timer, Verified, Flag, Star, StarBorder, ArrowBack, ArrowForward
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { user, isAdmin } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    disaster_type: '',
    priority: '',
    status: '',
    search: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newReportForm, setNewReportForm] = useState({
    disaster_type: '',
    priority: 'MEDIUM',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    phone_number: '',
    photos: []
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [voting, setVoting] = useState({});
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);


  useEffect(() => {
      fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setUpdateStatus('updating');
      
        const response = await axios.get('http://localhost:8000/api/sos_reports/sos_reports/');
        const reportsData = response.data.results || response.data || [];
        
      setReports(reportsData);
        setUpdateStatus('success');
    } catch (error) {
      console.error('Error fetching reports:', error);
      setUpdateStatus('error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (reportId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/sos_reports/sos_reports/${reportId}/updates/`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const addComment = async (reportId) => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`http://localhost:8000/api/sos_reports/sos_reports/${reportId}/updates/`, {
        message: newComment.trim()
      }, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setNewComment('');
      fetchComments(reportId);
      setSnackbar({
        open: true,
        message: 'Comment added successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add comment. Please try again.',
        severity: 'error'
      });
    }
  };
    
  const handleVote = async (reportId, voteType) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please login to vote',
        severity: 'warning'
      });
      return;
    }

    setVoting(prev => ({ ...prev, [reportId]: true }));

    try {
      const response = await axios.post(`http://localhost:8000/api/sos_reports/sos_reports/${reportId}/votes/`, {
        vote_type: voteType
      }, {
          headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSnackbar({
        open: true,
        message: `Vote recorded: ${voteType.replace('_', ' ')}`,
        severity: 'success'
      });
        
      // Refresh reports to get updated vote counts
      fetchReports();
    } catch (error) {
      console.error('Error voting:', error);
      setSnackbar({
        open: true,
        message: 'Failed to vote. Please try again.',
        severity: 'error'
      });
    } finally {
      setVoting(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + newReportForm.photos.length > 5) {
      setSnackbar({
        open: true,
        message: 'Maximum 5 photos allowed',
        severity: 'warning'
      });
      return;
    }

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setNewReportForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const removePhoto = (index) => {
    setNewReportForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const filterReports = () => {
    let filtered = reports;

    if (filters.disaster_type) {
      filtered = filtered.filter(report => report.disaster_type === filters.disaster_type);
    }

    if (filters.priority) {
      filtered = filtered.filter(report => report.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(report => 
        report.description?.toLowerCase().includes(searchLower) ||
        report.address?.toLowerCase().includes(searchLower) ||
        report.disaster_type?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReports(filtered);
  };

  const handleCreateReport = async () => {
    try {
      // Basic validation
      if (!newReportForm.disaster_type) {
      setSnackbar({
        open: true,
          message: 'Please select a disaster type.',
          severity: 'error'
      });
      return;
    }

      if (!newReportForm.description || newReportForm.description.trim().length < 10) {
        setSnackbar({
          open: true,
          message: 'Please provide a description with at least 10 characters.',
          severity: 'error'
        });
        return;
      }
      
      if (!newReportForm.address || newReportForm.address.trim().length < 5) {
        setSnackbar({
          open: true,
          message: 'Please provide a valid address.',
          severity: 'error'
        });
        return;
      }
      
      if (!newReportForm.latitude || !newReportForm.longitude) {
      setSnackbar({
        open: true,
          message: 'Please provide location coordinates.',
        severity: 'error'
      });
        return;
      }

          const formData = new FormData();
      
      // Add basic report data
          formData.append('disaster_type', newReportForm.disaster_type);
          formData.append('priority', newReportForm.priority);
      formData.append('description', newReportForm.description);
      formData.append('latitude', parseFloat(newReportForm.latitude));
      formData.append('longitude', parseFloat(newReportForm.longitude));
      formData.append('address', newReportForm.address);
      formData.append('phone_number', newReportForm.phone_number);

      // Add photos
      newReportForm.photos.forEach((photo, index) => {
        formData.append('files', photo.file);
      });

      let response;
      const isEditMode = selectedReport && selectedReport.id;
      
      if (isEditMode) {
        // Update existing report
        response = await axios.put(`http://localhost:8000/api/sos_reports/sos_reports/${selectedReport.id}/`, formData, {
            headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
          });
        } else {
        // Create new report
        response = await axios.post('http://localhost:8000/api/sos_reports/sos_reports/', formData, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSnackbar({
        open: true,
        message: isEditMode ? 'Report updated successfully!' : 'Report created successfully!',
        severity: 'success'
      });
        
      setCreateDialogOpen(false);
      setSelectedReport(null);
      setNewReportForm({
        disaster_type: '',
        priority: 'MEDIUM',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        phone_number: '',
        photos: []
      });

      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
      
      let errorMessage = 'Failed to save report. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          // Show specific validation errors
          const errorData = error.response.data;
          if (typeof errorData === 'object' && errorData !== null) {
            const errorMessages = [];
            for (const [field, messages] of Object.entries(errorData)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
        } else {
                errorMessages.push(`${field}: ${messages}`);
              }
            }
            errorMessage = `Validation errors: ${errorMessages.join('; ')}`;
          } else {
            errorMessage = `Validation error: ${errorData}`;
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Please log in again to continue.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      }
      
        setSnackbar({
          open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/sos_reports/sos_reports/${reportId}/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });

        setSnackbar({
          open: true,
        message: 'Report deleted successfully!',
          severity: 'success'
        });

      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete report. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleEditReport = (report) => {
    // Set the form data to the selected report
    setNewReportForm({
      disaster_type: report.disaster_type,
      priority: report.priority,
      description: report.description,
      latitude: report.latitude,
      longitude: report.longitude,
      address: report.address,
      phone_number: report.phone_number,
      photos: []
    });
    
    // Set the report to edit
    setSelectedReport(report);
    
    // Open the create dialog in edit mode
    setCreateDialogOpen(true);
    
    setSnackbar({
      open: true,
      message: 'Edit mode activated. Modify the report details below.',
      severity: 'info'
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by this browser.',
        severity: 'error'
      });
      return;
    }

    setSnackbar({
      open: true,
      message: 'Getting your current location...',
      severity: 'info'
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setNewReportForm(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        
        // Reverse geocoding to get address
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(response => response.json())
          .then(data => {
            const address = `${data.locality || ''} ${data.city || ''} ${data.principalSubdivision || ''} ${data.countryName || ''}`.trim();
            setNewReportForm(prev => ({
              ...prev,
              address: address || `${latitude}, ${longitude}`
            }));
          })
          .catch(() => {
            setNewReportForm(prev => ({
              ...prev,
              address: `${latitude}, ${longitude}`
            }));
          });

        setSnackbar({
          open: true,
          message: 'Location obtained successfully!',
          severity: 'success'
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setSnackbar({
          open: true,
          message: 'Unable to get your location. Please enter it manually.',
          severity: 'error'
        });
      }
    );
  };

  const generateAIDescription = async () => {
    if (!newReportForm.disaster_type || !newReportForm.address) {
      setSnackbar({
        open: true,
        message: 'Please select disaster type and location first.',
        severity: 'warning'
      });
      return;
    }

    setSnackbar({
      open: true,
      message: 'Generating AI description...',
      severity: 'info'
    });

    try {
      const response = await axios.post('http://localhost:8000/api/ai/generate-description/', {
        disaster_type: newReportForm.disaster_type,
        location: newReportForm.address,
        priority: newReportForm.priority
      }, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.description) {
        setNewReportForm(prev => ({
          ...prev,
          description: response.data.description
        }));
        
        setSnackbar({
          open: true,
          message: 'AI description generated successfully!',
          severity: 'success'
        });
      } else {
        throw new Error('No description generated');
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      
      // Fallback: Generate a basic description locally
      const disasterType = newReportForm.disaster_type.toLowerCase();
      const location = newReportForm.address;
      const priority = newReportForm.priority.toLowerCase();
      
      const basicDescription = `Emergency ${disasterType} situation reported at ${location}. This is a ${priority} priority incident requiring immediate attention. The situation is developing and poses potential risk to public safety. Emergency services have been notified and are responding to the scene.`;
      
    setNewReportForm(prev => ({
      ...prev,
        description: basicDescription
      }));
      
      setSnackbar({
        open: true,
        message: 'Using fallback description. AI service unavailable.',
        severity: 'warning'
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#FF1744';
      case 'HIGH': return '#FF9800';
      case 'MEDIUM': return '#FFC107';
      case 'LOW': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'VERIFIED': return '#9C27B0';
      case 'IN_PROGRESS': return '#9C27B0';
      case 'RESOLVED': return '#4CAF50';
      case 'REJECTED': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDisasterIcon = (disasterType) => {
    switch (disasterType) {
      case 'FLOOD': return <Water sx={{ color: '#2196F3', fontSize: 28 }} />;
      case 'EARTHQUAKE': return <Terrain sx={{ color: '#795548', fontSize: 28 }} />;
      case 'FIRE': return <LocalFireDepartment sx={{ color: '#F44336', fontSize: 28 }} />;
      case 'MEDICAL': return <MedicalServices sx={{ color: '#4CAF50', fontSize: 28 }} />;
      case 'ACCIDENT': return <DirectionsCar sx={{ color: '#FF9800', fontSize: 28 }} />;
      default: return <CrisisAlert sx={{ color: '#9C27B0', fontSize: 28 }} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const canEditReport = (report) => {
    return isAdmin || (user && report.user && report.user.id === user.id);
  };

  const canDeleteReport = (report) => {
    return isAdmin || (user && report.user && report.user.id === user.id);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
    fetchComments(report.id);
  };

  const openPhotoModal = (index) => {
    setSelectedPhotoIndex(index);
    setPhotoModalOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ 
      py: 3,
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)'
        },
        '50%': {
          transform: 'scale(1.05)',
          boxShadow: '0 6px 25px rgba(255, 107, 107, 0.6)'
        },
        '100%': {
          transform: 'scale(1)',
          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)'
        }
      }
    }}>
      {/* Enhanced Header */}
    <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3, 
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 6px 24px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 3px 15px rgba(255, 107, 107, 0.4)',
              animation: 'pulse 2s infinite'
            }}>
              🚨
            </Box>
            <Box>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 0.25,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                Emergency Reports
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
                fontSize: { xs: '0.8rem', md: '0.95rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Real-time emergency reporting and community response
                </Typography>
            </Box>
          </Box>
          
          {/* Stats Row */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 1.5,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: '#4CAF50',
                boxShadow: '0 0 10px rgba(76, 175, 80, 0.6)'
              }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {reports.length} Active Reports
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: '#FF9800',
                boxShadow: '0 0 10px rgba(255, 152, 0, 0.6)'
              }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Community Monitored
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: '#2196F3',
                boxShadow: '0 0 10px rgba(33, 150, 243, 0.6)'
              }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                AI Verified
              </Typography>
            </Box>
          </Box>
        </Box>
          
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedReport(null);
            setNewReportForm({
              disaster_type: '',
              priority: 'MEDIUM',
              description: '',
              latitude: '',
              longitude: '',
              address: '',
              phone_number: '',
              photos: []
            });
            setCreateDialogOpen(true);
          }}
          sx={{ 
            borderRadius: 4,
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF5252, #FF7043)',
              boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Create Report
        </Button>
            </Box>
            

      {/* Enhanced Filters */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
          🔍 Filter Reports
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Reports"
              placeholder="Type to search emergency reports..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <Search sx={{ 
                    mr: 1, 
                    color: '#667eea',
                    fontSize: '1.2rem'
                  }} />
                )
              }}
              size="small"
              sx={{
                  borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)'
                  },
                  '&.Mui-focused': {
                    border: '2px solid #667eea',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#667eea',
                  fontWeight: 600,
                  '&.Mui-focused': {
                    color: '#667eea'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  color: '#2c3e50',
                  fontWeight: 500,
                  '&::placeholder': {
                    color: '#95a5a6',
                    opacity: 1,
                    fontWeight: 400
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Disaster Type</InputLabel>
              <Select
                value={filters.disaster_type}
                onChange={(e) => setFilters({ ...filters, disaster_type: e.target.value })}
                label="Disaster Type"
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="FLOOD">🌊 Flood</MenuItem>
                <MenuItem value="EARTHQUAKE">🌍 Earthquake</MenuItem>
                <MenuItem value="FIRE">🔥 Fire</MenuItem>
                <MenuItem value="CYCLONE">🌀 Cyclone</MenuItem>
                <MenuItem value="LANDSLIDE">⛰️ Landslide</MenuItem>
                <MenuItem value="MEDICAL">🏥 Medical</MenuItem>
                <MenuItem value="ACCIDENT">🚗 Accident</MenuItem>
                <MenuItem value="OTHER">⚠️ Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                label="Priority"
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="CRITICAL">🔴 Critical</MenuItem>
                <MenuItem value="HIGH">🟠 High</MenuItem>
                <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
                <MenuItem value="LOW">🟢 Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="PENDING">⏳ Pending</MenuItem>
                <MenuItem value="VERIFIED">✅ Verified</MenuItem>
                <MenuItem value="IN_PROGRESS">🔄 In Progress</MenuItem>
                <MenuItem value="RESOLVED">✅ Resolved</MenuItem>
                <MenuItem value="REJECTED">❌ Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterList />}
              onClick={() => setFilters({ disaster_type: '', priority: '', status: '', search: '' })}
              fullWidth
              sx={{ 
                borderRadius: 2,
                py: 1,
                fontSize: '0.9rem',
                borderWidth: 1.5,
                '&:hover': {
                  borderWidth: 1.5,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 4 }}>
          <LinearProgress 
                sx={{
              borderRadius: 4, 
              height: 8,
              background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #4ECDC4, #FF6B6B)'
              }
            }} 
          />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Loading emergency reports...
          </Typography>
        </Box>
      )}

      {/* Enhanced Reports Grid */}
      {!loading && filteredReports.length === 0 ? (
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '2px dashed #dee2e6',
                  position: 'relative',
          overflow: 'hidden',
          '&::before': {
                    content: '""',
                    position: 'absolute',
            top: -50,
            left: -50,
            right: -50,
            bottom: -50,
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Box sx={{
              width: 100,
              height: 100,
                              borderRadius: '50%',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <Emergency sx={{ fontSize: 50, color: 'white' }} />
                        </Box>
            
            <Typography variant="h4" sx={{ 
                            fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
                          }}>
                No Emergency Reports Found
                          </Typography>
            
            <Typography variant="h6" sx={{ 
              color: 'text.secondary',
              mb: 4,
              maxWidth: 600,
              margin: '0 auto 2rem',
              lineHeight: 1.6
            }}>
              {reports.length === 0 
                ? "No emergency reports have been created yet. Be the first to report an emergency and help keep your community safe!"
                : "No reports match your current filters. Try adjusting your search criteria to find what you're looking for."
              }
                          </Typography>
                        </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedReport(null);
              setNewReportForm({
                disaster_type: '',
                priority: 'MEDIUM',
                description: '',
                latitude: '',
                longitude: '',
                address: '',
                phone_number: '',
                photos: []
              });
              setCreateDialogOpen(true);
            }}
                          sx={{ 
              borderRadius: 4,
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Create First Report
          </Button>
            </Paper>
        ) : (
        <Grid container spacing={4}>
          {filteredReports.map((report, index) => (
            <Grid item xs={12} md={6} lg={4} key={report.id}>
              <Zoom in={true} timeout={300 + index * 100}>
                <Card sx={{
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  '&:hover': { 
                    transform: 'translateY(-4px) scale(1.01)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,107,107,0.3)',
                  }
                }}>
                    {/* Enhanced Header */}
                  <CardHeader
                        sx={{
                      pb: 1,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '8px 8px 0 0'
                    }}
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Warning sx={{ color: '#FFD700', fontSize: 24 }} />
                          <LocationOn sx={{ color: '#87CEEB', fontSize: 24 }} />
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {new Date(report.created_at).toLocaleDateString('en-GB')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                              label={`${report.priority.toLowerCase()} priority`}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                                backgroundColor: getPriorityColor(report.priority),
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20,
                                mr: 1
                              }}
                            />
                    <Box sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%',
                              bgcolor: getStatusColor(report.status),
                              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                            }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {report.status}
                      </Typography>
                    </Box>
                        </Box>
                      </Box>
                    }
                  />

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Enhanced Incident Type */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {getDisasterIcon(report.disaster_type)}
                          <Typography variant="h5" sx={{ 
                            fontWeight: 'bold', 
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {report.disaster_type}
                      </Typography>
                    </Box>

                    {/* Enhanced Main Image */}
                    {report.media && report.media.length > 0 ? (
                      <Box sx={{ 
                                position: 'relative',
                        mb: 3, 
                        borderRadius: 3, 
                                overflow: 'hidden',
                                cursor: 'pointer',
                        '&:hover .image-overlay': {
                          opacity: 1
                        }
                      }}
                      onClick={() => openPhotoModal(0)}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={report.media[0].file_url || report.media[0].image_url}
                          alt={report.disaster_type}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                                '&:hover': {
                              transform: 'scale(1.05)'
                          }
                        }}
                      />
                        <Box className="image-overlay" sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          color: 'white',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 2,
                          opacity: 0,
                          transition: 'opacity 0.3s ease'
                        }}>
                          <Box 
                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                              onClick={() => {
                              setSelectedPhotos(report.media);
                              setPhotoGalleryOpen(true);
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              View All Photos
                            </Typography>
                            {report.media.length > 1 && (
                      <Chip
                                label={`+${report.media.length - 1}`} 
                        size="small"
                        sx={{
                                  bgcolor: 'rgba(255,255,255,0.2)', 
                                  color: 'white',
                                  fontSize: '0.7rem',
                            fontWeight: 'bold'
                        }}
                      />
                            )}
                              </Box>
                            </Box>
                      </Box>
                    ) : (
                            <Box sx={{
                        height: 160, 
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
                              display: 'flex',
                        flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                      borderRadius: 2,
                        mb: 2,
                        border: '2px dashed #ccc'
                      }}>
                        <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No photos available
                      </Typography>
                      </Box>
                    )}

                    {/* Enhanced Description */}
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2, 
                        minHeight: 40,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                        fontSize: '0.9rem'
                      }}
                    >
                        {report.description}
                      </Typography>

                    {/* Compact Community Poll with Voting Buttons */}
                    <Box sx={{ 
                      mb: 2, 
                      p: 1.5,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                      borderRadius: 1.5,
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <People sx={{ color: '#2196F3', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                          Community Poll
                          </Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                            {report.vote_counts?.still_there || 0}
                        </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            Still There
                        </Typography>
                      </Box>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                            {report.vote_counts?.resolved || 0}
                        </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            Resolved
                      </Typography>
                    </Box>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                            {report.vote_counts?.fake_report || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            Fake Report
                      </Typography>
                    </Box>
                      </Stack>
                      
                      <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          Total: {report.vote_counts?.total || 0} votes • 
                          {report.vote_counts?.total > 0 ? 
                            ` Resolved: ${report.vote_percentages?.resolved || 0}%` : 
                            ' No votes yet'
                          }
                        </Typography>
                      </Box>

                      {/* Compact Voting Buttons */}
                      <Box sx={{ width: '100%', mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textAlign: 'center', fontSize: '0.65rem' }}>
                          Cast your vote:
                          </Typography>
                        <Stack direction="row" spacing={0.8} sx={{ width: '100%' }}>
                          <Button
                            size="small" 
                            variant={report.user_vote === 'STILL_THERE' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => handleVote(report.id, 'STILL_THERE')}
                            disabled={voting[report.id]}
                            startIcon={<Timer sx={{ fontSize: 14 }} />}
                              sx={{
                              flex: 1, 
                              fontSize: '0.65rem',
                                borderRadius: 1,
                              py: 0.8,
                              fontWeight: 'bold',
                              minWidth: 0,
                              boxShadow: report.user_vote === 'STILL_THERE' ? '0 2px 8px rgba(255, 152, 0, 0.3)' : 'none',
                                '&:hover': {
                                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Still There
                          </Button>
                          <Button
                            size="small"
                            variant={report.user_vote === 'RESOLVED' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => handleVote(report.id, 'RESOLVED')}
                            disabled={voting[report.id]}
                            startIcon={<CheckCircle sx={{ fontSize: 14 }} />}
                            sx={{ 
                              flex: 1, 
                              fontSize: '0.65rem',
                              borderRadius: 1,
                              py: 0.8,
                              fontWeight: 'bold',
                              minWidth: 0,
                              boxShadow: report.user_vote === 'RESOLVED' ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none',
                              '&:hover': { 
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Resolved
                          </Button>
                          <Button
                            size="small"
                            variant={report.user_vote === 'FAKE_REPORT' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => handleVote(report.id, 'FAKE_REPORT')}
                            disabled={voting[report.id]}
                            startIcon={<Flag sx={{ fontSize: 14 }} />}
                            sx={{ 
                              flex: 1, 
                              fontSize: '0.65rem',
                              borderRadius: 1,
                              py: 0.8,
                              fontWeight: 'bold',
                              minWidth: 0,
                              boxShadow: report.user_vote === 'FAKE_REPORT' ? '0 2px 8px rgba(244, 67, 54, 0.3)' : 'none',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Fake Report
                          </Button>
                        </Stack>
                        </Box>
                      </Box>

                    {/* Enhanced Location with Map Navigation and Comments Opposite */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <LocationOn sx={{ fontSize: 20, color: '#2196F3' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            flex: 1,
                            cursor: 'pointer',
                            color: '#2196F3',
                            textDecoration: 'underline',
                            '&:hover': { 
                              color: '#1976D2'
                            }
                          }}
                          onClick={() => {
                            const mapUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
                            window.open(mapUrl, '_blank');
                          }}
                        >
                          {report.address}
                        </Typography>
                    </Box>

                      {/* Comments Count Opposite to Location */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: 'rgba(156, 39, 176, 0.1)',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        border: '1px solid rgba(156, 39, 176, 0.2)'
                      }}>
                        <Comment sx={{ fontSize: 18, color: '#9C27B0' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                          {report.updates?.length || 0} comments
                      </Typography>
                      </Box>
                    </Box>

                  </CardContent>

                  {/* Enhanced Actions */}
                  <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1.5 }}>
                    {/* Action Buttons - Different for owner vs other users */}
                    {canEditReport(report) ? (
                      // Owner can see Edit and Delete buttons
                      <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
                        <Button
                            size="small" 
                          startIcon={<Visibility />}
                            onClick={() => handleViewReport(report)}
                            sx={{ 
                            flex: 1, 
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                              color: 'white',
                              '&:hover': { 
                              background: 'linear-gradient(45deg, #1976D2, #00BCD4)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          View Details
                        </Button>
                        
                        <Button
                              size="small"
                          startIcon={<Edit />}
                              onClick={() => handleEditReport(report)}
                              sx={{ 
                            flex: 1, 
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
                                color: 'white',
                                '&:hover': { 
                              background: 'linear-gradient(45deg, #F57C00, #FF9800)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                              size="small"
                          startIcon={<Delete />}
                          color="error"
                          onClick={() => handleDeleteReport(report.id)}
                              sx={{ 
                            flex: 1,
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 'bold',
                                '&:hover': { 
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    ) : (
                      // Other users only see View Details button (full width)
                      <Button
                              size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewReport(report)}
                        fullWidth
                              sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                color: 'white',
                                '&:hover': { 
                            background: 'linear-gradient(45deg, #1976D2, #00BCD4)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        View Details
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
      </Grid>
      )}

      {/* Enhanced View Report Dialog with Photos */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '16px 16px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedReport && getDisasterIcon(selectedReport.disaster_type)}
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {selectedReport?.disaster_type} Report Details
          </Typography>
          </Box>
          <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedReport && (
            <Box>
              {/* Report Details */}
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>Priority</Typography>
                  <Chip 
                    label={selectedReport.priority} 
                    sx={{ 
                      backgroundColor: getPriorityColor(selectedReport.priority),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      py: 2,
                      px: 3
                    }}
                  />
            </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>Status</Typography>
                  <Chip 
                    label={selectedReport.status} 
                    sx={{ 
                      backgroundColor: getStatusColor(selectedReport.status),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      py: 2,
                      px: 3
                    }}
                  />
            </Grid>
            <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>Description</Typography>
                  <Typography variant="body1" sx={{ 
                    mb: 2, 
                    p: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 3,
                    lineHeight: 1.6,
                    fontSize: '1.1rem'
                  }}>
                    {selectedReport.description}
                  </Typography>
            </Grid>
            <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>Location</Typography>
                <Box sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 3,
                    lineHeight: 1.6,
                    fontSize: '1.1rem'
                  }}>
                    {selectedReport.address}
                  </Box>
            </Grid>
            <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>Phone Number</Typography>
                  <Typography variant="body1" sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    fontFamily: 'monospace'
                  }}>
                    {selectedReport.phone_number}
                  </Typography>
            </Grid>
            
                {/* Photo Gallery */}
                {selectedReport.media && selectedReport.media.length > 0 && (
              <Grid item xs={12}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      📸 Report Photos ({selectedReport.media.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedReport.media.map((media, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ 
                          position: 'relative',
                            borderRadius: 2,
                          overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              transition: 'transform 0.2s ease'
                            }
                          }}>
                            <img
                              src={media.file_url || media.image_url}
                              alt={`Report photo ${index + 1}`}
                          style={{
                            width: '100%',
                                height: 200,
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                // Open full-size image in new tab
                                window.open(media.file_url || media.image_url, '_blank');
                              }}
                            />
                            <Box sx={{
                            position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            color: 'white',
                              p: 1
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                Photo {index + 1}
                              </Typography>
                  </Box>
                </Box>
              </Grid>
                      ))}
          </Grid>
                  </Grid>
                )}

                {/* AI Analysis */}
                {selectedReport.ai_analysis_data && Object.keys(selectedReport.ai_analysis_data).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      🤖 AI Analysis
          </Typography>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Confidence</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={selectedReport.ai_confidence * 100} 
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {Math.round(selectedReport.ai_confidence * 100)}%
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Fraud Score</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={selectedReport.ai_fraud_score * 100} 
                              color={selectedReport.ai_fraud_score > 0.7 ? 'error' : 'warning'}
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {Math.round(selectedReport.ai_fraud_score * 100)}%
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip 
                            label={selectedReport.ai_verified ? 'Verified' : 'Pending Review'}
                            color={selectedReport.ai_verified ? 'success' : 'warning'}
                  size="small"
                            sx={{ mt: 0.5 }}
                />
                        </Grid>
                      </Grid>
              </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Enhanced Community Poll Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HowToVote color="primary" />
                  Community Poll
              </Typography>
              
                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'grey.50' }}>
                  {/* Vote Counts */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.contrastText' }}>
                          {selectedReport.vote_counts?.still_there || 0}
              </Typography>
                        <Typography variant="caption" sx={{ color: 'warning.contrastText' }}>
                          Still There
                </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>
                          {selectedReport.vote_counts?.resolved || 0}
                  </Typography>
                        <Typography variant="caption" sx={{ color: 'success.contrastText' }}>
                          Resolved
                    </Typography>
                </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.contrastText' }}>
                          {selectedReport.vote_counts?.fake_report || 0}
                    </Typography>
                        <Typography variant="caption" sx={{ color: 'error.contrastText' }}>
                          Fake Report
                    </Typography>
                  </Box>
                    </Grid>
                  </Grid>

                  {/* Vote Progress Bars */}
                  {selectedReport.vote_counts?.total > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Total Votes: {selectedReport.vote_counts.total}
                  </Typography>
                      <Box sx={{ display: 'flex', height: 20, borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ 
                          flex: selectedReport.vote_percentages?.still_there || 0,
                          bgcolor: 'warning.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {selectedReport.vote_percentages?.still_there || 0}%
              </Typography>
                        </Box>
                  <Box sx={{ 
                          flex: selectedReport.vote_percentages?.resolved || 0,
                          bgcolor: 'success.main',
                    display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {selectedReport.vote_percentages?.resolved || 0}%
                          </Typography>
                        </Box>
                        <Box sx={{
                          flex: selectedReport.vote_percentages?.fake_report || 0,
                          bgcolor: 'error.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {selectedReport.vote_percentages?.fake_report || 0}%
                          </Typography>
                        </Box>
                  </Box>
                </Box>
              )}
              
                  {/* Voting Buttons */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cast your vote:
              </Typography>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button 
                      variant={selectedReport.user_vote === 'STILL_THERE' ? 'contained' : 'outlined'}
                      color="warning"
                      startIcon={<ReportProblem />}
                      onClick={() => handleVote(selectedReport.id, 'STILL_THERE')}
                      disabled={voting[selectedReport.id]}
                      sx={{ 
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none'
                      }}
                    >
                      Still There
          </Button>
            <Button 
                      variant={selectedReport.user_vote === 'RESOLVED' ? 'contained' : 'outlined'}
                      color="success"
                      startIcon={<CheckCircleOutline />}
                      onClick={() => handleVote(selectedReport.id, 'RESOLVED')}
                      disabled={voting[selectedReport.id]}
              sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none'
                      }}
                    >
                      Resolved
            </Button>
            <Button 
                      variant={selectedReport.user_vote === 'FAKE_REPORT' ? 'contained' : 'outlined'}
                      color="error"
                      startIcon={<CancelOutlined />}
                      onClick={() => handleVote(selectedReport.id, 'FAKE_REPORT')}
                      disabled={voting[selectedReport.id]}
                      sx={{ 
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none'
                      }}
                    >
                      Fake Report
                    </Button>
                  </Stack>
                </Paper>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Comments Section */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Comment color="primary" />
                Comments & Updates ({comments.length})
              </Typography>

              {/* Add Comment */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment or update about this report..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
              variant="contained"
                  onClick={() => addComment(selectedReport.id)}
                  disabled={!newComment.trim()}
              sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2, #00ACC1)',
                    }
                  }}
                >
                  Add Comment
            </Button>
              </Box>

              {/* Comments List */}
              <List>
                {comments.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No comments yet"
                      secondary="Be the first to add a comment or update about this report"
                    />
                  </ListItem>
                ) : (
                  comments.map((comment, index) => (
                    <ListItem key={index} sx={{ alignItems: 'flex-start', mb: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {comment.user?.first_name?.[0] || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {comment.user?.first_name} {comment.user?.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(comment.created_at)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ 
                            whiteSpace: 'pre-wrap',
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                          }}>
                            {comment.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)} 
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Report Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          {selectedReport && selectedReport.id ? '✏️ Edit Emergency Report' : '🚨 Create Emergency Report'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                <InputLabel>Disaster Type</InputLabel>
                <Select
                  value={newReportForm.disaster_type}
                    onChange={(e) => setNewReportForm({ ...newReportForm, disaster_type: e.target.value })}
                  label="Disaster Type"
                >
                  <MenuItem value="FLOOD">🌊 Flood</MenuItem>
                    <MenuItem value="EARTHQUAKE">🌍 Earthquake</MenuItem>
                  <MenuItem value="FIRE">🔥 Fire</MenuItem>
                  <MenuItem value="CYCLONE">🌀 Cyclone</MenuItem>
                    <MenuItem value="LANDSLIDE">⛰️ Landslide</MenuItem>
                    <MenuItem value="MEDICAL">🏥 Medical Emergency</MenuItem>
                    <MenuItem value="ACCIDENT">🚗 Accident</MenuItem>
                    <MenuItem value="OTHER">⚠️ Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newReportForm.priority}
                    onChange={(e) => setNewReportForm({ ...newReportForm, priority: e.target.value })}
                  label="Priority"
                  >
                    <MenuItem value="CRITICAL">🔴 Critical</MenuItem>
                    <MenuItem value="HIGH">🟠 High</MenuItem>
                  <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
                    <MenuItem value="LOW">🟢 Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
              
            <Grid item xs={12}>
                <TextField
                  fullWidth
                label="Description"
                multiline
                rows={3}
                value={newReportForm.description}
                    onChange={(e) => setNewReportForm({ ...newReportForm, description: e.target.value })}
                    placeholder="Describe the emergency situation in detail..."
              />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
                    onClick={generateAIDescription}
                  sx={{ 
                      minWidth: 'auto',
                    px: 1.5,
                      py: 0.8,
                  borderRadius: 1.5,
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                      background: 'linear-gradient(45deg, #9C27B0, #E91E63)',
                      color: 'white',
                      border: 'none',
                        '&:hover': {
                        background: 'linear-gradient(45deg, #7B1FA2, #C2185B)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    AI Generate
                </Button>
              </Box>
                <Typography variant="caption" color="text.secondary">
                  💡 Let AI help you create a detailed description based on disaster type and location
                    </Typography>
            </Grid>
              
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                    label="Location"
                    value={newReportForm.address}
                    onChange={(e) => setNewReportForm({ ...newReportForm, address: e.target.value })}
                    placeholder="Enter location or click 'Get Current Location'"
                  />
                <Button
                  variant="outlined"
                    startIcon={<LocationOn />}
                    onClick={getCurrentLocation}
                      sx={{
                      minWidth: 'auto',
                      px: 2,
                  borderRadius: 2, 
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Get Current Location
                    </Button>
                  </Box>
                <Typography variant="caption" color="text.secondary">
                  Coordinates: {newReportForm.latitude ? `${newReportForm.latitude}, ${newReportForm.longitude}` : 'Not set'}
                </Typography>
            </Grid>
            
              <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newReportForm.phone_number}
                  onChange={(e) => setNewReportForm({ ...newReportForm, phone_number: e.target.value })}
                  placeholder="+919876543210"
              />
            </Grid>
            
              {/* Photo Upload */}
            <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  📸 Upload Photos (Max 5)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  multiple
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                    <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mb: 2 }}
                  >
                    Add Photos
                    </Button>
                </label>
                
                {/* Photo Previews */}
                {newReportForm.photos.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {newReportForm.photos.map((photo, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={photo.preview}
                          alt={photo.name}
                          style={{
                          width: 80,
                          height: 80,
                            objectFit: 'cover',
                            borderRadius: 8
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' }
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
            )}
              </Grid>
          </Grid>
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateReport}
            variant="contained"
            disabled={!newReportForm.disaster_type || !newReportForm.description}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252, #FF7043)',
              }
            }}
          >
            {selectedReport && selectedReport.id ? 'Update Report' : 'Create Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Photo Gallery Dialog */}
      <Dialog 
        open={photoGalleryOpen}
        onClose={() => setPhotoGalleryOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            📸 Photo Gallery ({selectedPhotos.length} photos)
          </Typography>
          <IconButton 
            onClick={() => setPhotoGalleryOpen(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {selectedPhotos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ 
                  position: 'relative',
                borderRadius: 2, 
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease'
                  }
                }}>
                  <img
                    src={photo.file_url || photo.image_url}
                    alt={`Photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: 250,
                      objectFit: 'cover',
                      cursor: 'pointer'
                }}
                onClick={() => {
                      setSelectedPhotoIndex(index);
                      setPhotoModalOpen(true);
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white',
                    p: 1.5
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Photo {index + 1}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Full-size Photo Modal */}
      <Dialog
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
                  borderRadius: 2, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setPhotoModalOpen(false)}
                        sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <Close />
          </IconButton>
          
          {selectedPhotos[selectedPhotoIndex] && (
            <img
              src={selectedPhotos[selectedPhotoIndex].file_url || selectedPhotos[selectedPhotoIndex].image_url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
                          style={{
                            width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
          
          {selectedPhotos.length > 1 && (
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1
            }}>
                        <IconButton
                onClick={() => setSelectedPhotoIndex(Math.max(0, selectedPhotoIndex - 1))}
                disabled={selectedPhotoIndex === 0}
                          sx={{
                  bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                        >
                <ArrowBack />
                        </IconButton>
              <IconButton
                onClick={() => setSelectedPhotoIndex(Math.min(selectedPhotos.length - 1, selectedPhotoIndex + 1))}
                disabled={selectedPhotoIndex === selectedPhotos.length - 1}
            sx={{
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <ArrowForward />
          </IconButton>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Reports;