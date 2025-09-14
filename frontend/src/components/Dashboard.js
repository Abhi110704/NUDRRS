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
  Comment, People, Timer, CheckCircle, Flag, Send
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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


  // Handle report viewing
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
    fetchComments(report.id);
  };

  // Fetch comments for a report
  const fetchComments = async (reportId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/sos_reports/sos_reports/${reportId}/updates/`, {
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
        `http://localhost:8000/api/sos_reports/sos_reports/${selectedReport.id}/updates/`,
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

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
        setUpdateStatus('updating');
      
      // Fetch real data from backend
        const [statsResponse, reportsResponse] = await Promise.all([
            axios.get(`http://localhost:8000/api/sos_reports/sos_reports/dashboard_stats/`),
            axios.get(`http://localhost:8000/api/sos_reports/sos_reports/?limit=5`)
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
        user: report.user || { first_name: 'User', last_name: 'Name' }
          }));
          
          setStats(transformedStats);
          setRecentReports(transformedReports);

          // Fetch user-specific reports if user is logged in and not admin/manager
          if (user && !isAdmin && !isManager) {
            try {
              const userReportsResponse = await axios.get(`http://localhost:8000/api/sos_reports/?user=${user.id}`);
              const userReportsData = userReportsResponse.data.results || userReportsResponse.data || [];
              setUserReports(Array.isArray(userReportsData) ? userReportsData : []);
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Emergency Dashboard
            </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchDashboardData} 
              disabled={loading}
              color="primary"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
              backgroundColor: updateStatus === 'success' ? 'success.main' : 
                              updateStatus === 'error' ? 'error.main' : 'warning.main'
            }} />
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatTimeAgo(lastUpdate)}
        </Typography>
          </Box>
        </Box>
      </Box>


      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats?.total_reports || 0}
                  </Typography>
                </Box>
                <Report sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

          <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats?.pending_reports || 0}
                  </Typography>
                </Box>
                <AccessTime sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main">
                    {stats?.active_reports || 0}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Resolved
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats?.resolved_reports || 0}
                  </Typography>
                </Box>
                <Security sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      {/* Recent Reports */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
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
              
              {(!recentReports || !Array.isArray(recentReports) || recentReports.length === 0) ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(Array.isArray(recentReports) ? recentReports : []).map((report) => (
                    <Box 
                      key={report.id}
              sx={{ 
                        p: 2, 
                        border: 1, 
                        borderColor: 'divider', 
                        borderRadius: 1,
                cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      onClick={() => handleViewReport(report)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {report.disaster_type}
                </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={report.priority} 
                            size="small" 
                            color={getPriorityColor(report.priority)}
                          />
                          <Chip 
                            label={report.status} 
                            size="small" 
                            color={getStatusColor(report.status)}
                          />
                        </Box>
      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {report.description}
        </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {report.address}
            </Typography>
                        <Typography variant="caption" sx={{ ml: 'auto' }}>
                          {formatTimeAgo(report.created_at)}
            </Typography>
                </Box>
                  </Box>
                  ))}
                  </Box>
                )}
              </CardContent>
            </Card>
        </Grid>

        {/* User Reports (if not admin/manager) */}
        {user && !isAdmin && !isManager && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  My Reports
            </Typography>
                
                {(!userReports || !Array.isArray(userReports) || userReports.length === 0) ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="text.secondary" variant="body2">
                      You haven't created any reports yet.
                      </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/reports')}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Create Report
                    </Button>
                </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(Array.isArray(userReports) ? userReports : []).slice(0, 5).map((report) => (
                      <Box 
                        key={report.id}
                        sx={{ 
                          p: 1.5, 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => handleViewReport(report)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {report.disaster_type}
                    </Typography>
                      <Chip
                        label={report.status}
                        size="small"
                            color={getStatusColor(report.status)}
                      />
                    </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(report.created_at)}
                    </Typography>
                    </Box>
            ))}
                  </Box>
                )}
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
                    sx={{ borderRadius: 2 }}
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
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(comment.created_at)}
                </Typography>
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
    </Box>
  );
};

export default Dashboard;