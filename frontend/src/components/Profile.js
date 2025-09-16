import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, Grid, Card, CardContent,
  Button, TextField, Divider, Chip, useTheme, useMediaQuery,
  IconButton, Tooltip, Alert, Snackbar
} from '@mui/material';
import {
  Edit, Save, Cancel, Person, Email, Phone, Business,
  Security, LocationOn, AccessTime, Emergency, CloudUpload,
  PhotoCamera, Delete, Image as ImageIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, isDemoMode, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone_number || '',
    organization: user?.profile?.organization?.name || ''
  });
  
  // Image upload states
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const fileInputRef = useRef(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Update image preview when user data changes
  useEffect(() => {
    if (user?.profile_image_url) {
      setImagePreview(user.profile_image_url);
    }
  }, [user?.profile_image_url]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you would typically save the data to the backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      phone: user?.profile?.phone_number || '',
      organization: user?.profile?.organization?.name || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  // Image upload handlers
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please select a valid image file',
          severity: 'error'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size must be less than 5MB',
          severity: 'error'
        });
        return;
      }

      setProfileImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', profileImage);

      // Upload to backend
      const response = await axios.post(
        'http://localhost:8000/api/auth/upload-profile-image/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Profile image uploaded successfully!',
          severity: 'success'
        });
        
        // Update the image preview with the new URL immediately
        if (response.data.image_url) {
          setImagePreview(response.data.image_url);
        }
        
        // Refresh user profile to get updated data and update global state
        const updatedUser = await refreshUserProfile();
        if (updatedUser?.profile_image_url) {
          setImagePreview(updatedUser.profile_image_url);
        }
        
        // Clear the selected file
        setProfileImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload image. Please try again.',
        severity: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return '#f44336';
      case 'MANAGER': return '#ff9800';
      case 'RESPONDER': return '#2196f3';
      case 'VIEWER': return '#4caf50';
      default: return '#757575';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return '👑';
      case 'MANAGER': return '⚡';
      case 'RESPONDER': return '🚨';
      case 'VIEWER': return '👁️';
      default: return '👤';
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      p: { xs: 2, md: 3 },
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)',
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h3" gutterBottom sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            👤 User Profile
          </Typography>
          <Typography variant="h6" sx={{
            opacity: 0.9,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Manage your account and emergency response settings
            {isDemoMode && (
              <Chip
                label="DEMO MODE"
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              />
            )}
          </Typography>
        </Box>
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          fontSize: '8rem',
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }}>
          👤
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              {/* Avatar Section */}
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: imagePreview 
                  ? 'transparent' 
                  : 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)',
                mb: 3,
                boxShadow: '0 8px 32px rgba(211, 47, 47, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </Typography>
                )}
                {isDemoMode && (
                  <Box sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    fontSize: '1.5rem'
                  }}>
                    🎯
                  </Box>
                )}
              </Box>

              {/* User Info */}
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                @{user?.username}
              </Typography>

              {/* Role Badge */}
              <Chip
                icon={<span>{getRoleIcon(user?.profile?.role || 'VIEWER')}</span>}
                label={user?.profile?.role || 'VIEWER'}
                sx={{
                  backgroundColor: getRoleColor(user?.profile?.role || 'VIEWER'),
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2
                }}
              />

              {/* Demo Mode Indicator */}
              {isDemoMode && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <strong>Demo Mode Active:</strong> You're viewing training data
                  </Typography>
                </Alert>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 3 }}>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b71c1c 0%, #e65100 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(211, 47, 47, 0.4)'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        fullWidth
                        color="success"
                      >
                        Save
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        fullWidth
                        color="error"
                      >
                        Cancel
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Box>

              {/* Profile Image Upload Section */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <PhotoCamera sx={{ fontSize: 20 }} />
                  Profile Photo
                </Typography>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                    sx={{
                      borderColor: '#d32f2f',
                      color: '#d32f2f',
                      '&:hover': {
                        borderColor: '#b71c1c',
                        backgroundColor: 'rgba(211, 47, 47, 0.04)'
                      }
                    }}
                  >
                    Choose Photo
                  </Button>
                  
                  {profileImage && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        onClick={handleImageUpload}
                        disabled={uploadingImage}
                        fullWidth
                        sx={{
                          backgroundColor: '#4caf50',
                          '&:hover': { backgroundColor: '#45a049' }
                        }}
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={handleRemoveImage}
                        color="error"
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                  
                  <Typography variant="caption" sx={{ 
                    color: 'text.secondary', 
                    textAlign: 'center',
                    fontSize: '0.75rem'
                  }}>
                    Supported formats: JPG, PNG, GIF (Max 5MB)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
                Profile Information
              </Typography>

              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2, 
                    color: '#d32f2f',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Person sx={{ fontSize: 20 }} />
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={isEditing ? editData.firstName : (user?.first_name || '')}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={isEditing ? editData.lastName : (user?.last_name || '')}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2, 
                    color: '#2196f3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Email sx={{ fontSize: 20 }} />
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={isEditing ? editData.email : (user?.email || '')}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={isEditing ? editData.phone : (user?.profile?.phone_number || '')}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Organization Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2, 
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Business sx={{ fontSize: 20 }} />
                    Organization Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Organization"
                        name="organization"
                        value={isEditing ? editData.organization : (user?.profile?.organization?.name || '')}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="e.g., NDRF, Police, Hospital, NGO"
                        InputProps={{
                          startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* System Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2, 
                    color: '#9c27b0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Security sx={{ fontSize: 20 }} />
                    System Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="User ID"
                        value={user?.id || 'N/A'}
                        disabled
                        InputProps={{
                          startAdornment: <Security sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Account Type"
                        value={user?.is_superuser ? 'Administrator' : 'Standard User'}
                        disabled
                        InputProps={{
                          startAdornment: <Security sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
