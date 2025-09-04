import React, { useState, useEffect } from 'react';
import { Switch, FormControlLabel, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const DataSourceToggle = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch current data source when component mounts
    const fetchDataSource = async () => {
      try {
        const response = await axios.get('/api/sos_reports/data-source/');
        setIsDemoMode(response.data.source === 'demo');
      } catch (err) {
        console.error('Error fetching data source:', err);
        setError('Failed to fetch current data source');
      }
    };

    fetchDataSource();
  }, []);

  const handleToggle = async (event) => {
    const newMode = event.target.checked ? 'demo' : 'real';
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/sos_reports/data-source/', {
        source: newMode
      });
      
      setIsDemoMode(response.data.source === 'demo');
      
      // Show success message
      alert(`Switched to ${response.data.source} data source`);
      
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (err) {
      console.error('Error updating data source:', err);
      setError('Failed to update data source');
      // Revert the toggle on error
      setIsDemoMode(!isDemoMode);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledPaper elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6">Data Source</Typography>
          <Typography variant="body2" color="textSecondary">
            {isDemoMode 
              ? 'Viewing demo data. Switch to real data when connected to production systems.' 
              : 'Viewing real data from production systems.'}
          </Typography>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={isDemoMode}
              onChange={handleToggle}
              disabled={isLoading}
              color="primary"
              inputProps={{ 'aria-label': 'toggle data source' }}
            />
          }
          label={isDemoMode ? 'Demo Mode' : 'Real Data'}
          labelPlacement="start"
        />
      </Box>
    </StyledPaper>
  );
};

export default DataSourceToggle;
