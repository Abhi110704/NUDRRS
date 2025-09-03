import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Visibility, LocationOn } from '@mui/icons-material';
import axios from 'axios';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/sos/reports/');
      const reportsData = response.data.results?.map(report => ({
        id: report.id,
        ...report.properties,
        coordinates: report.geometry.coordinates
      })) || [];
      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.post(`/api/sos/reports/${selectedReport.id}/update_status/`, {
        status: newStatus,
        message: updateMessage
      });
      setUpdateDialog(false);
      setNewStatus('');
      setUpdateMessage('');
      fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
    }
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

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'disaster_type', headerName: 'Type', width: 120 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPriorityColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      )
    },
    { field: 'address', headerName: 'Location', width: 200 },
    { field: 'phone_number', headerName: 'Contact', width: 130 },
    {
      field: 'ai_verified',
      headerName: 'AI Verified',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Chip label="Yes" color="success" size="small" />
        ) : (
          <Chip label="No" color="default" size="small" />
        )
      )
    },
    {
      field: 'created_at',
      headerName: 'Reported',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => setSelectedReport(params.row)}
          >
            View
          </Button>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => {
              setSelectedReport(params.row);
              setNewStatus(params.row.status);
              setUpdateDialog(true);
            }}
          >
            Update
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Emergency Reports Management
      </Typography>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={reports}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: 1,
              borderColor: 'divider'
            }
          }}
        />
      </Paper>

      {/* Report Details Dialog */}
      <Dialog
        open={!!selectedReport && !updateDialog}
        onClose={() => setSelectedReport(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Emergency Report Details
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedReport.disaster_type} Emergency
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={selectedReport.status}
                  color={getStatusColor(selectedReport.status)}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={selectedReport.priority}
                  color={getPriorityColor(selectedReport.priority)}
                />
              </Box>

              <Typography variant="body1" gutterBottom>
                <strong>Description:</strong> {selectedReport.description}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <LocationOn sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                <strong>Location:</strong> {selectedReport.address}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Contact:</strong> {selectedReport.phone_number}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Reported:</strong> {new Date(selectedReport.created_at).toLocaleString()}
              </Typography>

              {selectedReport.ai_verified && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  AI Verified with {(selectedReport.ai_confidence * 100).toFixed(0)}% confidence
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedReport(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setNewStatus(selectedReport.status);
              setUpdateDialog(true);
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={updateDialog}
        onClose={() => setUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
            <MenuItem value="FALSE_ALARM">False Alarm</MenuItem>
          </TextField>
          
          <TextField
            label="Update Message"
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            placeholder="Add a message about this status update..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={!newStatus}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsList;
