import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button, 
  LinearProgress, Alert, Snackbar, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar,
  Divider, List, ListItem, ListItemText, ListItemAvatar,
  Stack, Badge, Rating, Paper, TextField
} from '@mui/material';
import {
  TrendingUp, TrendingDown, PriorityHigh, Security, 
  Report, LocationOn, AccessTime, Refresh, Close,
  Comment, People, Timer, CheckCircle, Flag, Send,
  Warning, Map, Phone, Notifications, Shield, 
  LocalFireDepartment, Water, MedicalServices, 
  Terrain, LocalFireDepartment as Cyclone, 
  DirectionsCar, CrisisAlert, PieChart, BarChart,
  Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatTimeAgo } from '../utils/timeUtils';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isManager, userRole } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();
  const [updateStatus, setUpdateStatus] = useState('idle');
  const theme = useTheme();
  
  // Report details dialog state
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Broadcast alert dialog state
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertPriority, setAlertPriority] = useState('MEDIUM');
  const [alertType, setAlertType] = useState('GENERAL');

  // Comment dialog state
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentReport, setCommentReport] = useState(null);
  const [reportComments, setReportComments] = useState([]);
  const [newReportComment, setNewReportComment] = useState('');


  // Handle report viewing
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
    fetchComments(report.id);
  };

  // Fetch comments for a report
  const fetchComments = async (reportId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/sos_reports/${reportId}/updates/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  // Add comment to report
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReport) return;

    try {
      const response = await axios.post(
        `http://localhost:8000/api/sos_reports/${selectedReport.id}/updates/`,
        { message: newComment },
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle broadcast alert
  const handleBroadcastAlert = async () => {
    if (!alertMessage.trim()) return;

    try {
      const response = await axios.post(
        'http://localhost:8000/api/notifications/broadcast/',
        {
          message: alertMessage,
          priority: alertPriority,
          alert_type: alertType,
          broadcast_to_all: true
        },
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Reset form and close dialog
      setAlertMessage('');
      setAlertPriority('MEDIUM');
      setAlertType('GENERAL');
      setBroadcastDialogOpen(false);
      
      // Show success message
      alert('Alert broadcasted successfully!');
    } catch (error) {
      console.error('Error broadcasting alert:', error);
      alert('Failed to broadcast alert. Please try again.');
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8000/api/sos_reports/${selectedReport.id}/updates/${commentId}/`,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Remove comment from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // Check if user can delete comment
  const canDeleteComment = (comment) => {
    if (!user || !selectedReport) return false;
    
    // Admin can delete any comment
    if (isAdmin) return true;
    
    // Report owner can delete any comment on their report
    if (selectedReport.user === user.id) return true;
    
    // Comment author can delete their own comment (using user_id field)
    if (comment.user_id && comment.user_id === user.id) return true;
    
    return false;
  };

  // Handle opening comment dialog
  const handleOpenCommentDialog = async (report) => {
    setCommentReport(report);
    setCommentDialogOpen(true);
    await fetchReportComments(report.id);
  };

  // Fetch comments for a specific report
  const fetchReportComments = async (reportId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/sos_reports/${reportId}/updates/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      setReportComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setReportComments([]);
    }
  };

  // Add comment to report from comment dialog
  const handleAddReportComment = async () => {
    if (!newReportComment.trim() || !commentReport) return;

    try {
      const response = await axios.post(
        `http://localhost:8000/api/sos_reports/${commentReport.id}/updates/`,
        { message: newReportComment },
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setReportComments(prev => [...prev, response.data]);
      setNewReportComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Delete comment from comment dialog
  const handleDeleteReportComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8000/api/sos_reports/${commentReport.id}/updates/`,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          data: {
            comment_id: commentId
          }
        }
      );
      
      setReportComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // Check if user can delete comment in comment dialog
  const canDeleteReportComment = (comment) => {
    if (!user || !commentReport) return false;
    
    // Admin can delete any comment
    if (isAdmin) return true;
    
    // Report owner can delete any comment on their report
    if (commentReport.user === user.id) return true;
    
    // Comment author can delete their own comment (using user_id field)
    if (comment.user_id && comment.user_id === user.id) return true;
    
    return false;
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch comment counts for reports
  const fetchCommentCounts = async (reports, setReportsFunction) => {
    try {
      const reportsWithComments = await Promise.all(
        reports.map(async (report) => {
          try {
            const response = await axios.get(`http://localhost:8000/api/sos_reports/${report.id}/updates/`, {
              headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
              }
            });
            return {
              ...report,
              comment_count: response.data?.length || 0
            };
          } catch (error) {
            console.log(`Could not fetch comments for report ${report.id}:`, error);
            return {
              ...report,
              comment_count: report.comment_count || 0
            };
          }
        })
      );
      setReportsFunction(reportsWithComments);
    } catch (error) {
      console.log('Error fetching comment counts:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
        setUpdateStatus('updating');
      
      // Fetch real data from backend
        const [statsResponse, reportsResponse] = await Promise.all([
            axios.get(`http://localhost:8000/api/sos_reports/dashboard_stats/`),
            axios.get(`http://localhost:8000/api/sos_reports/?limit=2`)
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
          
          const reportsData = reportsResponse.data.results || reportsResponse.data || [];
      const transformedReports = (Array.isArray(reportsData) ? reportsData : []).map(report => ({
            ...report,
            disaster_type: report.disaster_type || report.properties?.disaster_type,
            status: report.status || report.properties?.status,
            priority: report.priority || report.properties?.priority,
            address: report.address || report.properties?.address,
            description: report.description || report.properties?.description,
        user: report.user || { first_name: 'User', last_name: 'Name' },
            comment_count: report.updates?.length || report.comment_count || 0
          }));
          
          setStats(transformedStats);
          setRecentReports(transformedReports);

          // Fetch comment counts for reports that don't have them
          await fetchCommentCounts(transformedReports, setRecentReports);

          // Fetch user-specific reports if user is logged in
          if (user) {
            try {
              const userReportsResponse = await axios.get(`http://localhost:8000/api/sos_reports/?user=${user.id}`);
              const userReportsData = userReportsResponse.data.results || userReportsResponse.data || [];
              const transformedUserReports = (Array.isArray(userReportsData) ? userReportsData : []).map(report => ({
                ...report,
                disaster_type: report.disaster_type || report.properties?.disaster_type,
                status: report.status || report.properties?.status,
                priority: report.priority || report.properties?.priority,
                address: report.address || report.properties?.address,
                description: report.description || report.properties?.description,
                user: report.user || { first_name: 'User', last_name: 'Name' },
                comment_count: report.updates?.length || report.comment_count || 0
              }));
              setUserReports(transformedUserReports);
              
              // Fetch comment counts for user reports
              await fetchCommentCounts(transformedUserReports, setUserReports);
            } catch (userReportsError) {
              console.log('Could not fetch user-specific reports:', userReportsError);
              setUserReports([]);
            }
          }

          setUpdateStatus('success');
          setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
          setUpdateStatus('error');
      
      // Set empty data when backend is not available
      setStats({
        total_reports: 0,
        pending_reports: 0,
        active_reports: 0,
        resolved_reports: 0,
        by_disaster_type: {},
        by_priority: {}
      });
      setRecentReports([]);
      setUserReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'VERIFIED': return 'info';
      case 'IN_PROGRESS': return 'primary';
      case 'RESOLVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };



  if (loading && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        borderRadius: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 6px 24px rgba(102, 126, 234, 0.3)'
      }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            National Unified Disaster Response System
            </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Real-time coordination for emergency response across India
            </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label="24/7 Active Monitoring" 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2
            }} 
          />
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchDashboardData} 
              disabled={loading}
              sx={{ color: 'white' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>


      {/* Key Metrics Section */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
        Key Metrics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    Active Alerts
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats?.pending_reports || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                    Real-time data
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    People Helped
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats?.resolved_reports || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                    Real-time data
                  </Typography>
                </Box>
                <Shield sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    Response Teams
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats?.total_reports || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                    Total reports
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats?.avg_response_time || '0'} min
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    Avg response
                  </Typography>
                </Box>
                <AccessTime sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      {/* Quick Actions Section */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)' 
              },
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => navigate('/reports')}
          >
            <CardContent sx={{ 
              textAlign: 'center', 
              p: 3,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Box sx={{ mb: 2 }}>
                <Warning sx={{ fontSize: 48, color: '#f44336' }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: '#333',
                fontSize: '1.1rem'
              }}>
                Report Emergency
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                Submit SOS report
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)' 
              },
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => navigate('/map')}
          >
            <CardContent sx={{ 
              textAlign: 'center', 
              p: 3,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Box sx={{ mb: 2 }}>
                <Map sx={{ fontSize: 48, color: '#2196f3' }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: '#333',
                fontSize: '1.1rem'
              }}>
                View Map
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                Live disaster tracking
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)' 
              },
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => navigate('/emergency-contacts')}
          >
            <CardContent sx={{ 
              textAlign: 'center', 
              p: 3,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Box sx={{ mb: 2 }}>
                <Phone sx={{ fontSize: 48, color: '#ff9800' }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: '#333',
                fontSize: '1.1rem'
              }}>
                Emergency Contacts
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                Helplines & shelters
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)' 
              },
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => setBroadcastDialogOpen(true)}
          >
            <CardContent sx={{ 
              textAlign: 'center', 
              p: 3,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Box sx={{ mb: 2 }}>
                <Notifications sx={{ fontSize: 48, color: '#00bcd4' }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: '#333',
                fontSize: '1.1rem'
              }}>
                Broadcast Alert
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                Send notifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Overview Section */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
        Analytics Overview
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChart sx={{ color: 'primary.main', fontSize: 20 }} />
                Reports by Disaster Type
              </Typography>
              
              {/* Calculate real data from reports */}
              {(() => {
                const disasterTypes = ['FIRE', 'FLOOD', 'MEDICAL', 'CYCLONE', 'LANDSLIDE', 'EARTHQUAKE'];
                const disasterCounts = {};
                const totalReports = recentReports.length;
                
                // Initialize counts
                disasterTypes.forEach(type => {
                  disasterCounts[type] = 0;
                });
                
                // Count actual reports
                recentReports.forEach(report => {
                  if (disasterCounts.hasOwnProperty(report.disaster_type)) {
                    disasterCounts[report.disaster_type]++;
                  }
                });
                
                // Calculate percentages
                const disasterData = disasterTypes.map(type => ({
                  type,
                  count: disasterCounts[type],
                  percentage: totalReports > 0 ? Math.round((disasterCounts[type] / totalReports) * 100) : 0,
                  color: {
                    'FIRE': '#F44336',
                    'FLOOD': '#2196F3',
                    'MEDICAL': '#4CAF50',
                    'CYCLONE': '#2E7D32',
                    'LANDSLIDE': '#FF9800',
                    'EARTHQUAKE': '#FFB74D'
                  }[type]
                }));
                
                // Calculate cumulative percentages for pie chart positioning
                let cumulativePercentage = 0;
                const pieData = disasterData.map(item => {
                  const startAngle = (cumulativePercentage / 100) * 360;
                  const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360;
                  cumulativePercentage += item.percentage;
                  
                  return {
                    ...item,
                    startAngle,
                    endAngle
                  };
                });
                
                return (
                  <>
                    {/* Circular Pie Chart */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, flex: 1 }}>
                      <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                        {/* Pie Chart SVG */}
                        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                          {pieData.map((item, index) => {
                            if (item.percentage === 0) return null;
                            
                            const circumference = 2 * Math.PI * 55;
                            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                            const strokeDashoffset = -(cumulativePercentage - item.percentage) / 100 * circumference;
                            
                            return (
                              <circle
                                key={item.type}
                                cx="70" cy="70" r="55"
                                fill="none"
                                stroke={item.color}
                                strokeWidth="25"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                              />
                            );
                          })}
                        </svg>
                        
                        {/* Center percentage label */}
                        <Box sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1 }}>
                            {totalReports}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Total Reports
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Legend */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {disasterData.map((item) => (
                        <Box key={item.type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            bgcolor: item.color, 
                            borderRadius: '50%' 
                          }} />
                          <Typography variant="caption" sx={{ flex: 1, fontSize: '0.65rem' }}>
                            {item.type}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}>
                            {item.percentage}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart sx={{ color: 'primary.main', fontSize: 20 }} />
                Reports by Priority
              </Typography>
              
              {/* Calculate real data from reports */}
              {(() => {
                const priorityCounts = { 'HIGH': 0, 'CRITICAL': 0, 'MEDIUM': 0, 'LOW': 0 };
                
                // Count actual reports by priority
                recentReports.forEach(report => {
                  if (priorityCounts.hasOwnProperty(report.priority)) {
                    priorityCounts[report.priority]++;
                  }
                });
                
                const maxCount = Math.max(...Object.values(priorityCounts));
                const maxHeight = 220; // Maximum bar height
                
                const priorityData = [
                  { priority: 'HIGH', count: priorityCounts.HIGH, color: '#F44336' },
                  { priority: 'CRITICAL', count: priorityCounts.CRITICAL, color: '#4CAF50' },
                  { priority: 'MEDIUM', count: priorityCounts.MEDIUM, color: '#FF9800' },
                  { priority: 'LOW', count: priorityCounts.LOW, color: '#2196F3' }
                ];
                
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', flex: 1 }}>
                    {/* Y-axis labels */}
                    <Box sx={{ display: 'flex', alignItems: 'end', gap: 4, height: 260, position: 'relative' }}>
                      {/* Y-axis */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', mr: 2 }}>
                        <Typography variant="caption" sx={{ textAlign: 'right', minWidth: 20 }}>
                          {maxCount}
                        </Typography>
                        <Typography variant="caption" sx={{ textAlign: 'right', minWidth: 20 }}>
                          {Math.ceil(maxCount * 0.75)}
                        </Typography>
                        <Typography variant="caption" sx={{ textAlign: 'right', minWidth: 20 }}>
                          {Math.ceil(maxCount * 0.5)}
                        </Typography>
                        <Typography variant="caption" sx={{ textAlign: 'right', minWidth: 20 }}>
                          {Math.ceil(maxCount * 0.25)}
                        </Typography>
                        <Typography variant="caption" sx={{ textAlign: 'right', minWidth: 20 }}>0</Typography>
                      </Box>
                      
                      {/* Bars */}
                      <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: '100%' }}>
                        {priorityData.map((item) => {
                          const barHeight = maxCount > 0 ? (item.count / maxCount) * maxHeight : 0;
                          
                          return (
                            <Box key={item.priority} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ 
                                width: 75, 
                                height: barHeight, 
                                bgcolor: item.color, 
                                borderRadius: '5px 5px 0 0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                minHeight: item.count > 0 ? 25 : 0
                              }}>
                                {item.count > 0 && (
                                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                                    {item.count}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '11px' }}>
                                {item.priority}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reports Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Recent Reports
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/reports')}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {(!recentReports || !Array.isArray(recentReports) || recentReports.length === 0) ? (
                  <Box sx={{ textAlign: 'center', py: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography color="text.secondary">
                      No reports found. Create your first emergency report!
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/reports')}
                      sx={{ mt: 2 }}
                    >
                      Create Report
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#ccc',
                      borderRadius: '3px',
                      '&:hover': {
                        background: '#999',
                      },
                    },
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
                      {(Array.isArray(recentReports) ? recentReports : []).map((report) => (
                        <Card 
                          key={report.id}
                          sx={{ 
                            cursor: 'pointer',
                            flexShrink: 0,
                            '&:hover': { 
                              boxShadow: 3,
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                          onClick={() => handleViewReport(report)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {report.disaster_type}
                              </Typography>
                              <Chip 
                                label={report.priority} 
                                size="small" 
                                color={getPriorityColor(report.priority)}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                              {report.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <LocationOn sx={{ fontSize: 16 }} />
                                <Typography variant="caption">
                                  {report.address}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(report.created_at)}
                              </Typography>
                            </Box>
                            
                            {/* Comment button */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Comment />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCommentDialog(report);
                                }}
                                sx={{ 
                                  bgcolor: '#f3e5f5',
                                  borderColor: '#ce93d8',
                                  color: '#7b1fa2',
                                  fontWeight: 'bold',
                                  '&:hover': { 
                                    bgcolor: '#e1bee7',
                                    borderColor: '#ba68c8'
                                  },
                                  borderRadius: 2,
                                  textTransform: 'none'
                                }}
                              >
                                {report.comment_count || 0} comments
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Reports */}
        {user && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', flexShrink: 0 }}>
                  My Reports
                </Typography>
                
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {(!userReports || !Array.isArray(userReports) || userReports.length === 0) ? (
                    <Box sx={{ textAlign: 'center', py: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography color="text.secondary" variant="h6" sx={{ mb: 2 }}>
                        You haven't created any reports yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#ccc',
                        borderRadius: '3px',
                        '&:hover': {
                          background: '#999',
                        },
                      },
                    }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
                        {(Array.isArray(userReports) ? userReports : []).map((report) => (
                          <Box 
                            key={report.id}
                            sx={{ 
                              p: 2, 
                              border: 1, 
                              borderColor: 'divider', 
                              borderRadius: 1,
                              cursor: 'pointer',
                              flexShrink: 0,
                              '&:hover': { backgroundColor: 'action.hover', boxShadow: 2 }
                            }}
                            onClick={() => handleViewReport(report)}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                {report.disaster_type}
                              </Typography>
                              <Chip
                                label={report.status}
                                size="medium"
                                color={getStatusColor(report.status)}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>
                            
                            {/* Comment button - positioned in right corner below status */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(report.created_at)}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Comment />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCommentDialog(report);
                                }}
                                sx={{ 
                                  bgcolor: '#f3e5f5',
                                  borderColor: '#ce93d8',
                                  color: '#7b1fa2',
                                  fontWeight: 'bold',
                                  fontSize: '0.6rem',
                                  py: 0.25,
                                  px: 1,
                                  minWidth: 'auto',
                                  '&:hover': { 
                                    bgcolor: '#e1bee7',
                                    borderColor: '#ba68c8'
                                  },
                                  borderRadius: 1.5
                                }}
                              >
                                {report.comment_count || 0} comments
                              </Button>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Create Report Button - Always at bottom */}
                <Box sx={{ textAlign: 'center', pt: 2, borderTop: 1, borderColor: 'divider', mt: 'auto', flexShrink: 0 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/reports')}
                    size="large"
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      px: 3,
                      py: 1.5,
                      fontSize: '1rem'
                    }}
                  >
                    Create New Report
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        </Grid>

      {/* Report Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
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
            📋 Emergency Report Details
          </Typography>
          <IconButton 
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedReport && (
          <Grid container spacing={3}>
              {/* Report Header */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {selectedReport.disaster_type}
                      </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={selectedReport.priority} 
                        color={getPriorityColor(selectedReport.priority)}
                        size="small"
                      />
                      <Chip
                        label={selectedReport.status} 
                        color={getStatusColor(selectedReport.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(selectedReport.created_at)}
                      </Typography>
                    </Box>
              </Grid>

              {/* Report Description */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Description
        </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedReport.description}
                </Typography>
              </Grid>

              {/* Location */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Location
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ color: '#2196F3' }} />
                  <Typography variant="body1">
                    {selectedReport.address}
                  </Typography>
                </Box>
            </Grid>

              {/* Photos */}
              {selectedReport.media && selectedReport.media.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📸 Report Photos ({selectedReport.media.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedReport.media.map((media, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ 
                          position: 'relative',
                  borderRadius: 0.5,
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
                </Grid>
              )}

              {/* Comments Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  💬 Comments ({comments.length})
        </Typography>
                
                {/* Add Comment */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    startIcon={<Send />}
                    sx={{ borderRadius: 0.5 }}
                  >
                    Send
                  </Button>
              </Box>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <List>
                    {comments.map((comment, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Comment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {comment.user?.username || 'Anonymous'}
                </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(comment.created_at)}
                </Typography>
                                {canDeleteComment(comment) && (
                                  <Tooltip title="Delete Comment">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      sx={{ 
                                        color: 'error.main',
                                        '&:hover': { bgcolor: 'error.light', color: 'white' }
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
              </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {comment.message}
                </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No comments yet. Be the first to comment!
                </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Broadcast Alert Dialog */}
      <Dialog 
        open={broadcastDialogOpen} 
        onClose={() => setBroadcastDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Notifications sx={{ color: 'primary.main' }} />
          Broadcast Emergency Alert
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Alert Type */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Alert Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { value: 'GENERAL', label: 'General', color: 'primary' },
                  { value: 'FIRE', label: 'Fire', color: 'error' },
                  { value: 'FLOOD', label: 'Flood', color: 'info' },
                  { value: 'MEDICAL', label: 'Medical', color: 'success' },
                  { value: 'EARTHQUAKE', label: 'Earthquake', color: 'warning' }
                ].map((type) => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    onClick={() => setAlertType(type.value)}
                    color={alertType === type.value ? type.color : 'default'}
                    variant={alertType === type.value ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Priority */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Priority Level
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { value: 'LOW', label: 'Low', color: 'success' },
                  { value: 'MEDIUM', label: 'Medium', color: 'warning' },
                  { value: 'HIGH', label: 'High', color: 'error' },
                  { value: 'CRITICAL', label: 'Critical', color: 'error' }
                ].map((priority) => (
                  <Chip
                    key={priority.value}
                    label={priority.label}
                    onClick={() => setAlertPriority(priority.value)}
                    color={alertPriority === priority.value ? priority.color : 'default'}
                    variant={alertPriority === priority.value ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Message */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Alert Message
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Enter your emergency alert message here..."
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setBroadcastDialogOpen(false)}
            sx={{ borderRadius: 0.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBroadcastAlert}
            disabled={!alertMessage.trim()}
            startIcon={<Notifications />}
            sx={{ borderRadius: 0.5 }}
          >
            Broadcast Alert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog 
        open={commentDialogOpen} 
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Comment sx={{ color: 'primary.main' }} />
          Comments - {commentReport?.disaster_type} Report
        </DialogTitle>
        <DialogContent>
          {commentReport && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Report Info */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {commentReport.disaster_type} - {commentReport.priority}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {commentReport.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Location: {commentReport.address}
                </Typography>
              </Box>

              {/* Add Comment Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Add Comment
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={newReportComment}
                    onChange={(e) => setNewReportComment(e.target.value)}
                    placeholder="Write your comment here..."
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddReportComment}
                    disabled={!newReportComment.trim()}
                    startIcon={<Send />}
                    sx={{ borderRadius: 0.5, mb: 0.5 }}
                  >
                    Send
                  </Button>
                </Box>
              </Box>

              {/* Comments List */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Comments ({reportComments.length})
                </Typography>
                {reportComments.length > 0 ? (
                  <List>
                    {reportComments.map((comment, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Comment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {comment.user?.username || 'Anonymous'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(comment.created_at)}
                                </Typography>
                                {canDeleteReportComment(comment) && (
                                  <Tooltip title="Delete Comment">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteReportComment(comment.id)}
                                      sx={{ 
                                        color: 'error.main',
                                        '&:hover': { bgcolor: 'error.light', color: 'white' }
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {comment.message}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setCommentDialogOpen(false)}
            sx={{ borderRadius: 0.5 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;