import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Alert, CircularProgress, Tabs, Tab
} from '@mui/material';
import {
  CheckCircle, Cancel, Visibility, Edit, Delete,
  Warning, Security, VerifiedUser, ReportProblem
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminPanel = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    console.log('🔍 AdminPanel - User:', user);
    console.log('🔍 AdminPanel - isAdmin:', isAdmin);
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/sos_reports/');
      console.log('🔍 AdminPanel API response:', response.data);
      const reportsData = Array.isArray(response.data) ? response.data : [];
      console.log('🔍 AdminPanel reports data:', reportsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Fallback to demo data
      setReports([
        {
          id: 1,
          disaster_type: 'FLOOD',
          priority: 'HIGH',
          status: 'PENDING',
          address: 'Mumbai, Maharashtra',
          description: 'Severe flooding in residential areas',
          created_at: new Date().toISOString(),
          user: { first_name: 'Rajesh', last_name: 'Kumar' },
          ai_confidence: 0.95
        },
        {
          id: 2,
          disaster_type: 'FIRE',
          priority: 'CRITICAL',
          status: 'VERIFIED',
          address: 'Delhi, NCR',
          description: 'High-rise building fire',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user: { first_name: 'Priya', last_name: 'Sharma' },
          ai_confidence: 0.92
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReport = async (reportId, action) => {
    try {
      const newStatus = action === 'verify' ? 'VERIFIED' : 'REJECTED';
      await axios.patch(`http://localhost:8000/api/sos_reports/${reportId}/`, {
        status: newStatus,
        verified_by: user.id,
        verified_at: new Date().toISOString()
      });
      
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, verified_by: user.id, verified_at: new Date().toISOString() }
          : report
      ));
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating report:', error);
      // For demo purposes, update locally
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'verify' ? 'VERIFIED' : 'REJECTED' }
          : report
      ));
      setOpenDialog(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ff9800';
      case 'VERIFIED': return '#4caf50';
      case 'REJECTED': return '#f44336';
      case 'IN_PROGRESS': return '#2196f3';
      case 'RESOLVED': return '#4caf50';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#d32f2f';
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
      case 'LANDSLIDE': return '⛰️';
      case 'CYCLONE': return '🌀';
      default: return '🚨';
    }
  };

  const pendingReports = Array.isArray(reports) ? reports.filter(r => r.status === 'PENDING') : [];
  const verifiedReports = Array.isArray(reports) ? reports.filter(r => r.status === 'VERIFIED') : [];
  const rejectedReports = Array.isArray(reports) ? reports.filter(r => r.status === 'REJECTED') : [];

  if (!isAdmin) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: '#f8fafc'
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Access Denied
          </Typography>
          <Typography>
            You need administrator privileges to access this panel.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 2, md: 3 },
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'white',
        borderRadius: 2,
        p: 4,
        mb: 4,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: '#1a202c',
              mb: 1
            }}>
              🛡️ Admin Panel
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#4a5568',
              fontSize: '1rem'
            }}>
              Emergency Report Verification & Management
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<VerifiedUser />}
              label={`Admin: ${user?.first_name} ${user?.last_name}`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={fetchReports}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <ReportProblem />}
            >
              Refresh Reports
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#ff9800',
                mb: 1
              }}>
                {pendingReports.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Pending Verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#4caf50',
                mb: 1
              }}>
                {verifiedReports.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Verified Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#f44336',
                mb: 1
              }}>
                {rejectedReports.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Rejected Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'white',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#2196f3',
                mb: 1
              }}>
                {reports.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Card sx={{ 
        background: 'white',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`Pending (${pendingReports.length})`} />
            <Tab label={`Verified (${verifiedReports.length})`} />
            <Tab label={`Rejected (${rejectedReports.length})`} />
          </Tabs>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>AI Confidence</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(tabValue === 0 ? pendingReports : 
                tabValue === 1 ? verifiedReports : rejectedReports).map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {report.address}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {report.description?.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>
                        {getDisasterIcon(report.disaster_type)}
                      </Typography>
                      {report.disaster_type}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.priority}
                      size="small"
                      sx={{
                        backgroundColor: getPriorityColor(report.priority),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(report.status),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {report.user?.first_name} {report.user?.last_name}
                  </TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      color: report.ai_confidence > 0.9 ? '#4caf50' : '#ff9800',
                      fontWeight: 600
                    }}>
                      {(report.ai_confidence * 100).toFixed(0)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewReport(report)}
                          sx={{ color: '#2196f3' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {report.status === 'PENDING' && (
                        <>
                          <Tooltip title="Verify Report">
                            <IconButton
                              size="small"
                              onClick={() => handleVerifyReport(report.id, 'verify')}
                              sx={{ color: '#4caf50' }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Reject Report">
                            <IconButton
                              size="small"
                              onClick={() => handleVerifyReport(report.id, 'reject')}
                              sx={{ color: '#f44336' }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 1, fontSize: '1.5rem' }}>
              {selectedReport && getDisasterIcon(selectedReport.disaster_type)}
            </Typography>
            Report Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Disaster Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReport.disaster_type}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Priority Level
                  </Typography>
                  <Chip
                    label={selectedReport.priority}
                    sx={{
                      backgroundColor: getPriorityColor(selectedReport.priority),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Current Status
                  </Typography>
                  <Chip
                    label={selectedReport.status}
                    sx={{
                      backgroundColor: getStatusColor(selectedReport.status),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                    AI Confidence
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: selectedReport.ai_confidence > 0.9 ? '#4caf50' : '#ff9800',
                    fontWeight: 600
                  }}>
                    {(selectedReport.ai_confidence * 100).toFixed(0)}%
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    📍 {selectedReport.address}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReport.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Reporter
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReport.user?.first_name} {selectedReport.user?.last_name}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Report Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Close
          </Button>
          {selectedReport?.status === 'PENDING' && (
            <>
              <Button
                onClick={() => handleVerifyReport(selectedReport.id, 'reject')}
                color="error"
                startIcon={<Cancel />}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleVerifyReport(selectedReport.id, 'verify')}
                color="success"
                startIcon={<CheckCircle />}
                variant="contained"
              >
                Verify
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
