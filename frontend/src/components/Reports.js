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
  LocationOn, Phone, Schedule, Security, Speed, Warning, CheckCircle, Close,
  CloudUpload, Image as ImageIcon, Delete as DeleteIcon, AutoAwesome, Psychology
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { user, isAdmin } = useAuth();
  
  // Get or create current user session for demo purposes
  const getCurrentUser = () => {
    try {
      let currentUser = localStorage.getItem('nudrrs_current_user');
      if (!currentUser) {
        currentUser = {
          id: 999, // Fixed ID for demo purposes
          username: 'current_user',
          first_name: 'Current',
          last_name: 'User'
        };
        localStorage.setItem('nudrrs_current_user', JSON.stringify(currentUser));
      } else {
        currentUser = JSON.parse(currentUser);
      }
      return currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        id: 999, // Fixed ID for demo purposes
        username: 'current_user',
        first_name: 'Current',
        last_name: 'User'
      };
    }
  };

  // Check if current user can edit a report (admin or report owner)
  const canEditReport = (report) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !report || !report.user) {
        return false;
      }
      return (isAdmin === true) || (report.user && report.user.id === currentUser.id);
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      return false;
    }
  };

  // Check if current user can upload images to a report (anyone can upload images)
  const canUploadImages = (report) => {
    return true; // Anyone can upload images to any report
  };

  // Check if current user can delete a report (admin or report owner)
  const canDeleteReport = (report) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !report || !report.user) {
        return false;
      }
      return (isAdmin === true) || (report.user && report.user.id === currentUser.id);
    } catch (error) {
      console.error('Error checking delete permissions:', error);
      return false;
    }
  };
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date()); // Track last update
  const [updateStatus, setUpdateStatus] = useState('idle'); // Update status: idle, updating, success, error
  const [liveUpdates, setLiveUpdates] = useState([]); // Store live updates
  
  // Modal states
  const [newReportDialog, setNewReportDialog] = useState(false);
  const [viewReportDialog, setViewReportDialog] = useState(false);
  const [editReportDialog, setEditReportDialog] = useState(false);
  const [addImagesDialog, setAddImagesDialog] = useState(false);
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

  // Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Location autocomplete states
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // AI Description states
  const [aiDescriptionLoading, setAiDescriptionLoading] = useState(false);
  const [aiEnhancedDescription, setAiEnhancedDescription] = useState('');
  const [showAiDescription, setShowAiDescription] = useState(false);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLocationSuggestions && !event.target.closest('.location-autocomplete')) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationSuggestions]);

  // Country codes for phone numbers
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳', display: 'India (+91)' },
    { code: '+1', country: 'USA', flag: '🇺🇸', display: 'United States (+1)' },
    { code: '+44', country: 'UK', flag: '🇬🇧', display: 'United Kingdom (+44)' },
    { code: '+86', country: 'China', flag: '🇨🇳', display: 'China (+86)' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', display: 'Japan (+81)' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', display: 'Germany (+49)' },
    { code: '+33', country: 'France', flag: '🇫🇷', display: 'France (+33)' },
    { code: '+61', country: 'Australia', flag: '🇦🇺', display: 'Australia (+61)' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', display: 'Brazil (+55)' },
    { code: '+7', country: 'Russia', flag: '🇷🇺', display: 'Russia (+7)' },
    { code: '+971', country: 'UAE', flag: '🇦🇪', display: 'UAE (+971)' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', display: 'Saudi Arabia (+966)' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', display: 'Pakistan (+92)' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', display: 'Bangladesh (+880)' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', display: 'Sri Lanka (+94)' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵', display: 'Nepal (+977)' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹', display: 'Bhutan (+975)' },
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
    addLiveUpdate('Live mode activated - connecting to backend', 'success');
    const cleanup = startLiveUpdates();
    return cleanup;
  }, []);

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
    const interval = setInterval(() => {
      fetchReports();
      setLastUpdate(new Date());
      addLiveUpdate('Data refreshed from backend', 'success');
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  };

  // Helper function to get demo reports
  const getDemoReports = () => {
    return [
      {
        id: 1,
        user: { id: 999, username: 'current_user', first_name: 'Current', last_name: 'User' },
        disaster_type: 'FLOOD',
        priority: 'HIGH',
        status: 'PENDING',
        description: 'Heavy rainfall causing severe waterlogging in residential areas. Water level rising rapidly, multiple families trapped and need immediate evacuation. Roads completely submerged.',
        address: 'Sector 15, Chandigarh, Punjab',
        phone_number: '+91-9876543210',
        created_at: new Date().toISOString(),
        ai_confidence: 0.92,
        media: [
          {
            id: 1,
            file: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            file_type: 'image'
          },
          {
            id: 2,
            file: 'https://images.unsplash.com/photo-1574263867122-4a1b0b0b0b0b?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      },
      {
        id: 2,
        user: { username: 'citizen2', first_name: 'Priya', last_name: 'Sharma' },
        disaster_type: 'FIRE',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        description: 'Massive factory fire spreading rapidly across multiple buildings. Thick black smoke visible from 5km away. Fire department on site but need additional resources and evacuation support.',
        address: 'Industrial Area, Gurgaon, Haryana',
        phone_number: '+91-9876543211',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        ai_confidence: 0.98,
        media: [
          {
            id: 3,
            file: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      },
      {
        id: 3,
        user: { username: 'citizen3', first_name: 'Amit', last_name: 'Singh' },
        disaster_type: 'EARTHQUAKE',
        priority: 'MEDIUM',
        status: 'VERIFIED',
        description: 'Moderate earthquake (5.2 magnitude) reported. Several old buildings showing cracks, checking for structural damages. No casualties reported yet but residents evacuated as precaution.',
        address: 'Hill Station Road, Shimla, Himachal Pradesh',
        phone_number: '+91-9876543212',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        ai_confidence: 0.85,
        media: [
          {
            id: 4,
            file: 'https://images.unsplash.com/photo-1574263867122-4a1b0b0b0b0b?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      },
      {
        id: 4,
        user: { username: 'citizen4', first_name: 'Suresh', last_name: 'Yadav' },
        disaster_type: 'LANDSLIDE',
        priority: 'HIGH',
        status: 'PENDING',
        description: 'Heavy rainfall triggered landslide blocking main highway. Multiple vehicles trapped, rescue operations underway. Road completely blocked for next 24-48 hours.',
        address: 'Mountain View, Dehradun, Uttarakhand',
        phone_number: '+91-9876543213',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        ai_confidence: 0.89,
        media: [
          {
            id: 5,
            file: 'https://images.unsplash.com/photo-1574263867122-4a1b0b0b0b0b?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      },
      {
        id: 5,
        user: { username: 'citizen5', first_name: 'Lakshmi', last_name: 'Patel' },
        disaster_type: 'CYCLONE',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        description: 'Cyclone warning issued. Wind speed increasing rapidly, heavy rainfall expected. Coastal areas being evacuated. Emergency shelters activated.',
        address: 'Coastal Area, Puri, Odisha',
        phone_number: '+91-9876543214',
        created_at: new Date(Date.now() - 900000).toISOString(),
        ai_confidence: 0.95,
        media: [
          {
            id: 6,
            file: 'https://images.unsplash.com/photo-1574263867122-4a1b0b0b0b0b?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      },
      {
        id: 6,
        user: { username: 'citizen6', first_name: 'Meera', last_name: 'Joshi' },
        disaster_type: 'MEDICAL',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        description: 'Medical emergency - multiple casualties from building collapse. Ambulance services dispatched, need additional medical support and rescue teams.',
        address: 'Old City, Ahmedabad, Gujarat',
        phone_number: '+91-9876543215',
        created_at: new Date(Date.now() - 5400000).toISOString(),
        ai_confidence: 0.91,
        media: [
          {
            id: 7,
            file: 'https://images.unsplash.com/photo-1574263867122-4a1b0b0b0b0b?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      },
      {
        id: 7,
        user: { username: 'citizen7', first_name: 'Vikram', last_name: 'Reddy' },
        disaster_type: 'DROUGHT',
        priority: 'MEDIUM',
        status: 'VERIFIED',
        description: 'Severe water shortage in rural areas. Wells dried up, crops failing. Need immediate water supply and relief measures.',
        address: 'Rural District, Telangana',
        phone_number: '+91-9876543216',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        ai_confidence: 0.87,
        media: [
          {
            id: 8,
            file: 'https://images.unsplash.com/photo-1574263867122-4a1b0b0b0b0b?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      },
      {
        id: 8,
        user: { username: 'citizen8', first_name: 'Anita', last_name: 'Desai' },
        disaster_type: 'STORM',
        priority: 'HIGH',
        status: 'PENDING',
        description: 'Severe thunderstorm with hailstorm causing damage to crops and property. Trees uprooted, power lines down.',
        address: 'Agricultural Area, Maharashtra',
        phone_number: '+91-9876543217',
        created_at: new Date(Date.now() - 2700000).toISOString(),
        ai_confidence: 0.93,
        media: [
          {
            id: 9,
            file: 'https://images.unsplash.com/photo-1574263867122-4a1b0b0b0b0b?w=400&h=300&fit=crop',
            file_type: 'image'
          }
        ]
      }
    ];
  };

  const fetchReports = async () => {
    try {
      let currentReports = [];
      
      setUpdateStatus('updating');
      // Try to fetch live data from backend
      try {
        const response = await axios.get('http://localhost:8000/api/sos_reports/sos_reports/');
        const reportsData = response.data.results || response.data || [];
        
        // Transform the data to ensure proper structure and fix media URLs
        currentReports = reportsData.map(report => ({
          ...report,
          disaster_type: report.disaster_type || report.properties?.disaster_type,
          status: report.status || report.properties?.status,
          priority: report.priority || report.properties?.priority,
          address: report.address || report.properties?.address,
          description: report.description || report.properties?.description,
          user: report.user ? {
            id: report.user.id,
            first_name: report.user.first_name || 'Anonymous',
            last_name: report.user.last_name || 'User',
            username: report.user.username || 'anonymous'
          } : { id: null, first_name: 'Anonymous', last_name: 'User', username: 'anonymous' },
          ai_confidence: report.ai_confidence || 0.85,
          ai_fraud_score: report.ai_fraud_score || 0.0,
          ai_analysis_data: report.ai_analysis_data || {},
          media: (report.media || []).map(media => {
            console.log('🔍 Processing media:', media);
            let fileUrl = media.file_url || media.file;
            
            // If it's a relative path, make it absolute
            if (fileUrl && !fileUrl.startsWith('http') && !fileUrl.startsWith('blob:')) {
              fileUrl = `http://localhost:8000${fileUrl}`;
            }
            
            console.log('🔍 Final file URL:', fileUrl);
            
            return {
              ...media,
              file: fileUrl
            };
          })
        }));
        
        console.log('✅ Live data loaded from backend:', currentReports);
        console.log('🔍 Media data sample:', currentReports[0]?.media);
        setUpdateStatus('success');
        addLiveUpdate(`✅ Live data loaded: ${currentReports.length} reports`, 'success');
      } catch (apiError) {
        console.log('Backend not available, falling back to demo data');
        setUpdateStatus('error');
        addLiveUpdate('⚠️ Backend connection failed - using demo data', 'error');
        // Fallback to demo data if backend is not available
        currentReports = getDemoReports();
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

  // Location autocomplete function
  const handleLocationSearch = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    setLocationLoading(true);
    try {
      // Using a free geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      
      const suggestions = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name.split(',')[0] + ', ' + item.display_name.split(',')[1]
      }));
      
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error('Location search error:', error);
      setLocationSuggestions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationSelect = (suggestion) => {
    setNewReportForm({
      ...newReportForm,
      address: suggestion.display_name
    });
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  // Image handling functions
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    console.log('📁 Files selected:', files);
    
    // Filter for image files only
    const imageFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      console.log(`📷 File: ${file.name}, Type: ${file.type}, Size: ${file.size}, Valid: ${isImage && isValidSize}`);
      return isImage && isValidSize;
    });
    
    // Check for invalid files
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    const oversizedFiles = files.filter(file => file.type.startsWith('image/') && file.size > 10 * 1024 * 1024);
    
    if (invalidFiles.length > 0) {
      setSnackbar({
        open: true,
        message: `⚠️ ${invalidFiles.length} non-image file(s) were skipped`,
        severity: 'warning'
      });
    }
    
    if (oversizedFiles.length > 0) {
      setSnackbar({
        open: true,
        message: `⚠️ ${oversizedFiles.length} image(s) were too large (max 10MB)`,
        severity: 'warning'
      });
    }
    
    if (imageFiles.length > 0) {
      console.log('✅ Valid images to add:', imageFiles);
      setSelectedImages(prev => [...prev, ...imageFiles]);
      
      // Create preview URLs
      const newPreviews = imageFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setImagePreview(prev => [...prev, ...newPreviews]);
      
      setSnackbar({
        open: true,
        message: `✅ ${imageFiles.length} image(s) added successfully`,
        severity: 'success'
      });
    } else if (files.length > 0) {
      setSnackbar({
        open: true,
        message: '❌ No valid images were selected',
        severity: 'error'
      });
    }
    
    // Clear the input value to allow selecting the same file again
    event.target.value = '';
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index].url);
      return newPreviews;
    });
  };

  const clearAllImages = () => {
    // Revoke all URLs to free memory
    imagePreview.forEach(preview => URL.revokeObjectURL(preview.url));
    setSelectedImages([]);
    setImagePreview([]);
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
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    clearAllImages();
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewReportDialog(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    
    // Parse country code from existing phone number
    const phoneNumber = report.phone_number || '';
    let countryCode = '+91';
    let phoneNumberOnly = phoneNumber;
    
    // Handle different phone number formats
    if (phoneNumber.startsWith('+')) {
      // Find the longest matching country code
      const sortedCodes = countryCodes.sort((a, b) => b.code.length - a.code.length);
      for (const country of sortedCodes) {
        if (phoneNumber.startsWith(country.code)) {
          countryCode = country.code;
          phoneNumberOnly = phoneNumber.substring(country.code.length);
          break;
        }
      }
    } else if (phoneNumber.includes('-')) {
      // Handle format like "+91-9876543210"
      const parts = phoneNumber.split('-');
      if (parts.length === 2) {
        countryCode = parts[0];
        phoneNumberOnly = parts[1];
      }
    }
    
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

  const handleAddImages = (report) => {
    setSelectedReport(report);
    setAddImagesDialog(true);
  };

  const submitImagesOnly = async () => {
    if (selectedImages.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one image to upload',
        severity: 'warning'
      });
      return;
    }

    try {
      setUploadingImages(true);
      
      // Try to upload to backend first
      try {
        const formData = new FormData();
        formData.append('phone_number', selectedReport.phone_number);
        formData.append('latitude', selectedReport.latitude);
        formData.append('longitude', selectedReport.longitude);
        formData.append('address', selectedReport.address);
        formData.append('disaster_type', selectedReport.disaster_type);
        formData.append('description', selectedReport.description);
        formData.append('priority', selectedReport.priority);
        
        // Add new image files
        selectedImages.forEach((file, index) => {
          formData.append('files', file);
        });
        
        const response = await axios.put(`http://localhost:8000/api/sos_reports/sos_reports/${selectedReport.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('✅ Images uploaded to backend, response:', response.data);
        console.log('🔍 Response media:', response.data.media);
        
        // Refresh data from backend to get the properly updated report with backend URLs
        await fetchReports();
        
        setAddImagesDialog(false);
        clearAllImages();
        setSnackbar({
          open: true,
          message: `✅ ${selectedImages.length} image(s) uploaded to backend successfully!`,
          severity: 'success'
        });
        
      } catch (apiError) {
        console.log('Backend upload failed, saving locally:', apiError.message);
        
        // Fallback to local storage
        const newMediaArray = selectedImages.map((file, index) => ({
          id: Date.now() + index,
          file: URL.createObjectURL(file),
          file_type: 'image',
          name: file.name,
          size: file.size
        }));
        
        // Combine existing media with new media
        const combinedMedia = [...(selectedReport.media || []), ...newMediaArray];
        
        // Update local state
        const updatedReports = reports.map(report => 
          report.id === selectedReport.id 
            ? { 
                ...report, 
                media: combinedMedia
              }
            : report
        );
        
        setReports(updatedReports);
        
        // Save to localStorage for persistence
        localStorage.setItem('nudrrs_reports', JSON.stringify(updatedReports));
        
        setAddImagesDialog(false);
        clearAllImages();
        setSnackbar({
          open: true,
          message: `⚠️ ${selectedImages.length} image(s) saved locally (backend unavailable)`,
          severity: 'warning'
        });
      }
      
    } catch (error) {
      console.error('Error adding images:', error);
      setSnackbar({
        open: true,
        message: '❌ Error adding images. Please try again.',
        severity: 'error'
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteReport = (report) => {
    setSelectedReport(report);
    setDeleteConfirmDialog(true);
  };

  const submitNewReport = async () => {
    // Get user's current location or use default coordinates
    let latitude = 28.6139; // Default to Delhi coordinates
    let longitude = 77.2090;
    
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (error) {
        console.log('Could not get location, using default coordinates');
      }
    }

    const currentUser = getCurrentUser();
    
    // Create media array from selected images
    const mediaArray = selectedImages.map((file, index) => ({
      id: Date.now() + index,
      file: URL.createObjectURL(file), // Create object URL for preview
      file_type: 'image',
      name: file.name,
      size: file.size
    }));
    
    const newReport = {
      id: Date.now(), // Generate unique ID
      user: currentUser,
      ...newReportForm,
      phone_number: `${newReportForm.countryCode}${newReportForm.phone_number}`,
      latitude: latitude,
      longitude: longitude,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ai_confidence: Math.random() * 0.3 + 0.7, // Random AI confidence between 0.7-1.0
      media: mediaArray // Add the media array
    };

    // Try to send to backend first
    try {
      setUploadingImages(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('phone_number', newReport.phone_number);
      formData.append('latitude', newReport.latitude);
      formData.append('longitude', newReport.longitude);
      formData.append('address', newReport.address);
      formData.append('disaster_type', newReport.disaster_type);
      formData.append('description', newReport.description);
      formData.append('priority', newReport.priority || 'MEDIUM');
      
      // Add image files
      selectedImages.forEach((file, index) => {
        formData.append('files', file);
      });
      
      const response = await axios.post('http://localhost:8000/api/sos_reports/sos_reports/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Report with images sent to backend:', response.data);
      console.log('🔍 Backend response media:', response.data.media);
      setUploadingImages(false);
      
      // Refresh data from backend to get the properly saved report with backend URLs
      await fetchReports();
      setSnackbar({
        open: true,
        message: `✅ Emergency report with ${selectedImages.length} image(s) sent to backend successfully!`,
        severity: 'success'
      });
      addLiveUpdate(`✅ New report with ${selectedImages.length} image(s) added to backend`, 'success');
    } catch (error) {
      console.error('Backend error, saving locally:', error);
      setUploadingImages(false);
      // Fallback to local storage only when backend fails
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
    
    setNewReportDialog(false);
  };

  const submitEditReport = async () => {
    try {
      // Try to update via backend API first
      try {
        setUploadingImages(true);
        
        // Create FormData for file upload if there are new images
        if (selectedImages.length > 0) {
          const formData = new FormData();
          formData.append('phone_number', `${newReportForm.countryCode}${newReportForm.phone_number}`);
          formData.append('latitude', selectedReport.latitude);
          formData.append('longitude', selectedReport.longitude);
          formData.append('address', newReportForm.address);
          formData.append('disaster_type', newReportForm.disaster_type);
          formData.append('description', newReportForm.description);
          formData.append('priority', newReportForm.priority);
          
          // Add new image files
          selectedImages.forEach((file, index) => {
            formData.append('files', file);
          });
          
          await axios.put(`http://localhost:8000/api/sos_reports/sos_reports/${selectedReport.id}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          // No new images, just update the report data
          const updatedReportData = {
            phone_number: `${newReportForm.countryCode}${newReportForm.phone_number}`,
            latitude: selectedReport.latitude,
            longitude: selectedReport.longitude,
            address: newReportForm.address,
            disaster_type: newReportForm.disaster_type,
            description: newReportForm.description,
            priority: newReportForm.priority
          };

          await axios.put(`http://localhost:8000/api/sos_reports/sos_reports/${selectedReport.id}/`, updatedReportData);
        }
        
        setUploadingImages(false);
        
        // Refresh data from backend to get the properly updated report with backend URLs
        await fetchReports();
        
        setEditReportDialog(false);
        clearAllImages(); // Clear selected images after successful update
        setSnackbar({
          open: true,
          message: selectedImages.length > 0 
            ? `Report updated successfully with ${selectedImages.length} new image(s)!`
            : 'Report updated successfully!',
          severity: 'success'
        });
        
      } catch (apiError) {
        console.log('Backend update failed, updating locally:', apiError.message);
        setUploadingImages(false);
        
        // Create media array from new selected images for fallback
        const newMediaArray = selectedImages.map((file, index) => ({
          id: Date.now() + index,
          file: URL.createObjectURL(file),
          file_type: 'image',
          name: file.name,
          size: file.size
        }));
        
        // Combine existing media with new media for fallback
        const combinedMedia = [...(selectedReport.media || []), ...newMediaArray];
        
        // Fallback to local update
        const updatedReports = reports.map(report => 
          report.id === selectedReport.id 
            ? { 
                ...report, 
                ...newReportForm, 
                phone_number: `${newReportForm.countryCode}${newReportForm.phone_number}`,
                media: combinedMedia
              }
            : report
        );
        
        setReports(updatedReports);
        
        // Save to localStorage for persistence
        localStorage.setItem('nudrrs_reports', JSON.stringify(updatedReports));
        
        setEditReportDialog(false);
        clearAllImages(); // Clear selected images after successful update
        setSnackbar({
          open: true,
          message: selectedImages.length > 0 
            ? `Report updated locally with ${selectedImages.length} new image(s)!`
            : 'Report updated locally!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update report',
        severity: 'error'
      });
    }
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

  // AI Description Generation Functions
  const generateAiDescription = async () => {
    if (selectedImages.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please upload an image first to generate AI description',
        severity: 'warning'
      });
      return;
    }

    setAiDescriptionLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImages[0]);
      formData.append('disaster_type', newReportForm.disaster_type);
      formData.append('location', newReportForm.address);

      const response = await axios.post('http://localhost:8000/api/ai_services/generate-ai-description/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setAiEnhancedDescription(response.data.description);
        setShowAiDescription(true);
        setSnackbar({
          open: true,
          message: 'AI description generated successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to generate AI description',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      setSnackbar({
        open: true,
        message: 'Error generating AI description. Please try again.',
        severity: 'error'
      });
    } finally {
      setAiDescriptionLoading(false);
    }
  };

  const enhanceDescription = async () => {
    if (!newReportForm.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a description first to enhance it',
        severity: 'warning'
      });
      return;
    }

    setAiDescriptionLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/ai_services/enhance-description/', {
        description: newReportForm.description,
        disaster_type: newReportForm.disaster_type,
        location: newReportForm.address
      });

      if (response.data.success) {
        setAiEnhancedDescription(response.data.description);
        setShowAiDescription(true);
        setSnackbar({
          open: true,
          message: 'Description enhanced successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to enhance description',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
      setSnackbar({
        open: true,
        message: 'Error enhancing description. Please try again.',
        severity: 'error'
      });
    } finally {
      setAiDescriptionLoading(false);
    }
  };

  const useAiDescription = () => {
    setNewReportForm(prev => ({
      ...prev,
      description: aiEnhancedDescription
    }));
    setShowAiDescription(false);
    setSnackbar({
      open: true,
      message: 'AI description applied to form!',
      severity: 'success'
    });
  };

  const fetchDescriptionSuggestions = async () => {
    if (!newReportForm.disaster_type) {
      setSnackbar({
        open: true,
        message: 'Please select a disaster type first',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/ai_services/description-suggestions/', {
        params: {
          disaster_type: newReportForm.disaster_type,
          location: newReportForm.address
        }
      });

      setDescriptionSuggestions(response.data);
      setShowSuggestions(true);
      setSnackbar({
        open: true,
        message: 'Description suggestions loaded!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error fetching description suggestions:', error);
      
      // Provide demo suggestions when backend is not available
      const location = newReportForm.address || 'the area';
      
      // Determine location type for more specific suggestions
      const isUrban = location.toLowerCase().includes('city') || location.toLowerCase().includes('sector') || 
                     location.toLowerCase().includes('street') || location.toLowerCase().includes('road');
      const isRural = location.toLowerCase().includes('village') || location.toLowerCase().includes('rural') || 
                     location.toLowerCase().includes('district');
      const isCoastal = location.toLowerCase().includes('coastal') || location.toLowerCase().includes('beach') || 
                       location.toLowerCase().includes('puri') || location.toLowerCase().includes('goa');
      const isIndustrial = location.toLowerCase().includes('industrial') || location.toLowerCase().includes('factory') || 
                          location.toLowerCase().includes('plant');
      
      const demoSuggestions = {
        suggestions: [
          {
            title: `Professional ${newReportForm.disaster_type} Report - ${location}`,
            description: `This is a ${newReportForm.disaster_type.toLowerCase()} emergency in ${location} requiring immediate attention. The situation is developing rapidly and poses significant risk to public safety. Emergency services have been notified and are responding to the scene. Residents in the affected area are advised to evacuate immediately and follow all safety protocols.`,
            confidence: 0.95,
            disaster_type: newReportForm.disaster_type,
            location: location
          },
          {
            title: `Detailed ${newReportForm.disaster_type} Assessment - ${location}`,
            description: `A ${newReportForm.disaster_type.toLowerCase()} incident has been reported in ${location}. The situation appears to be escalating with potential for widespread impact. Multiple agencies are coordinating response efforts. Citizens are urged to avoid the affected area and monitor official updates for further instructions.`,
            confidence: 0.88,
            disaster_type: newReportForm.disaster_type,
            location: location
          },
          {
            title: `Concise ${newReportForm.disaster_type} Alert - ${location}`,
            description: `${newReportForm.disaster_type} emergency in progress at ${location}. Immediate response required. Please provide specific details about the current situation, any visible damage or injuries, and the exact location of the incident.`,
            confidence: 0.92,
            disaster_type: newReportForm.disaster_type,
            location: location
          },
          ...(isUrban ? [{
            title: `Urban ${newReportForm.disaster_type} Response - ${location}`,
            description: `${newReportForm.disaster_type} emergency in urban area ${location}. High population density requires coordinated evacuation and response efforts. Traffic management and emergency services coordination essential. Public transportation may be affected.`,
            confidence: 0.87,
            disaster_type: newReportForm.disaster_type,
            location: location
          }] : []),
          ...(isRural ? [{
            title: `Rural ${newReportForm.disaster_type} Alert - ${location}`,
            description: `${newReportForm.disaster_type} emergency in rural area ${location}. Limited access roads may affect emergency response time. Local community coordination essential. Agricultural areas and livestock may be at risk.`,
            confidence: 0.85,
            disaster_type: newReportForm.disaster_type,
            location: location
          }] : []),
          ...(isCoastal ? [{
            title: `Coastal ${newReportForm.disaster_type} Warning - ${location}`,
            description: `${newReportForm.disaster_type} emergency in coastal area ${location}. Marine rescue services may be required. Tidal conditions and weather patterns should be monitored. Fishing communities and tourism areas at risk.`,
            confidence: 0.89,
            disaster_type: newReportForm.disaster_type,
            location: location
          }] : []),
          ...(isIndustrial ? [{
            title: `Industrial ${newReportForm.disaster_type} Emergency - ${location}`,
            description: `${newReportForm.disaster_type} emergency in industrial area ${location}. Chemical safety protocols may be required. Industrial fire suppression systems activated. Worker evacuation and safety procedures in effect.`,
            confidence: 0.91,
            disaster_type: newReportForm.disaster_type,
            location: location
          }] : [])
        ]
      };
      
      setDescriptionSuggestions(demoSuggestions);
      setShowSuggestions(true);
      setSnackbar({
        open: true,
        message: 'Demo description suggestions loaded!',
        severity: 'success'
      });
    }
  };

  const applySuggestion = (suggestion) => {
    setNewReportForm(prev => ({
      ...prev,
      description: suggestion.description
    }));
    setShowSuggestions(false);
    setSnackbar({
      open: true,
      message: 'AI description applied to form!',
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
      {/* Compact Header */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        background: 'white',
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
              <Emergency sx={{ fontSize: 20, color: '#ef4444' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: '#1a202c',
                mb: 0.5,
                fontSize: '1.25rem'
              }}>
                Emergency Reports
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: updateStatus === 'updating' ? '#f59e0b' : 
                             updateStatus === 'success' ? '#10b981' : 
                             updateStatus === 'error' ? '#ef4444' : '#6b7280',
                  animation: updateStatus === 'updating' ? 'pulse 1.5s infinite' : 'none'
                }} />
                <Typography variant="caption" sx={{ 
                  color: '#6b7280',
                  fontWeight: 500
                }}>
                  {updateStatus === 'updating' ? 'Updating...' :
                   updateStatus === 'success' ? 'Live' :
                   updateStatus === 'error' ? 'Offline' : 'Idle'} • {lastUpdate.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                {filteredReports.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Total</Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                {filteredReports.filter(r => r.priority === 'CRITICAL').length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Critical</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                {isAdmin ? 'Admin' : 'User'}
              </Typography>
              <Avatar sx={{ 
                bgcolor: isAdmin ? '#ef4444' : '#6b7280', 
                width: 32, 
                height: 32,
                fontSize: '0.875rem'
              }}>
                {isAdmin ? 'A' : 'U'}
              </Avatar>
            </Box>
          </Box>
        </Box>
      </Paper>


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

                    {/* Image Display Section */}
                    {report.media && report.media.length > 0 && (
                      <Box sx={{ 
                        mb: 2.5,
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05))',
                        borderRadius: 2,
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <ImageIcon sx={{ 
                            color: '#3b82f6', 
                            mr: 1, 
                            fontSize: 18 
                          }} />
                          <Typography variant="subtitle2" sx={{ 
                            color: '#1e40af',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            📸 Attached Images ({report.media.length})
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 1,
                          maxHeight: '120px',
                          overflowY: 'auto'
                        }}>
                          {report.media.slice(0, 4).map((media, index) => (
                            <Box
                              key={media.id || index}
                              sx={{
                                position: 'relative',
                                width: 60,
                                height: 60,
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '2px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  borderColor: '#3b82f6',
                                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }
                              }}
                              onClick={() => {
                                // Open image in new tab or show in modal
                                let imageUrl = media.file;
                                if (!media.file.startsWith('http') && !media.file.startsWith('blob:')) {
                                  imageUrl = `http://localhost:8000${media.file}`;
                                }
                                window.open(imageUrl, '_blank');
                              }}
                            >
                              <img
                                src={media.file.startsWith('http') || media.file.startsWith('blob:')
                                  ? media.file 
                                  : `http://localhost:8000${media.file}`}
                                alt={`Emergency image ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onLoad={() => console.log('✅ Image loaded successfully:', media.file)}
                                onError={(e) => {
                                  console.log('❌ Image failed to load:', media.file);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <Box sx={{
                                display: 'none',
                                width: '100%',
                                height: '100%',
                                background: '#f3f4f6',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6b7280',
                                fontSize: '12px'
                              }}>
                                📷
                              </Box>
                            </Box>
                          ))}
                          {report.media.length > 4 && (
                            <Box sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                              border: '2px solid #d1d5db',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6b7280',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)'
                              }
                            }}>
                              +{report.media.length - 4}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

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
                          🤖 AI Analysis
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ 
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            color: report.ai_confidence > 0.9 ? '#27ae60' : 
                                   report.ai_confidence > 0.7 ? '#f39c12' : '#e74c3c'
                          }}>
                            {(report.ai_confidence * 100).toFixed(0)}%
                          </Typography>
                          {report.ai_fraud_score > 0.3 && (
                            <Typography variant="caption" sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              color: report.ai_fraud_score > 0.6 ? '#e74c3c' : '#f39c12',
                              bgcolor: report.ai_fraud_score > 0.6 ? '#fdf2f2' : '#fef9e7',
                              px: 0.8,
                              py: 0.3,
                              borderRadius: 1,
                              border: `1px solid ${report.ai_fraud_score > 0.6 ? '#e74c3c' : '#f39c12'}`
                            }}>
                              FRAUD: {(report.ai_fraud_score * 100).toFixed(0)}%
                            </Typography>
                          )}
                        </Box>
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
                          background: report.ai_fraud_score > 0.6 
                            ? 'linear-gradient(90deg, #e74c3c, #c0392b)' // Red for high fraud
                            : report.ai_confidence > 0.9 
                            ? 'linear-gradient(90deg, #4caf50, #66bb6a)' // Green for high confidence
                            : report.ai_confidence > 0.7
                            ? 'linear-gradient(90deg, #ff9800, #ffb74d)' // Orange for medium confidence
                            : 'linear-gradient(90deg, #f44336, #ef5350)', // Red for low confidence
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
                        
                        {/* Edit button - only visible to report creator or admin */}
                        {canEditReport(report) && (
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
                        )}
                        
                        {/* Add Images button - visible to all users who can't edit */}
                        {canUploadImages(report) && !canEditReport(report) && (
                          <Tooltip title="Add Images to Report" arrow>
                            <IconButton 
                              size="small"
                              onClick={() => handleAddImages(report)}
                              sx={{ 
                                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                                color: 'white',
                                width: 36,
                                height: 36,
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                '&:hover': { 
                                  background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                                  transform: 'scale(1.15) translateY(-2px)',
                                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <CloudUpload fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canDeleteReport(report) && (
                          <Tooltip title={isAdmin ? "Delete Report (Admin)" : "Delete My Report"} arrow>
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
                        )}
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

      {/* Compact New Emergency Report Dialog */}
      <Dialog 
        open={newReportDialog} 
        onClose={() => setNewReportDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
            🚨 New Emergency Report
          </Typography>
          <IconButton 
            onClick={() => setNewReportDialog(false)} 
            size="small"
            sx={{ color: '#6b7280' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Disaster Type</InputLabel>
                <Select
                  value={newReportForm.disaster_type}
                  label="Disaster Type"
                  onChange={(e) => setNewReportForm({...newReportForm, disaster_type: e.target.value})}
                  renderValue={(value) => {
                    const options = {
                      'FLOOD': '🌊 Flood',
                      'FIRE': '🔥 Fire', 
                      'EARTHQUAKE': '🌋 Earthquake',
                      'LANDSLIDE': '🏔️ Landslide',
                      'CYCLONE': '🌀 Cyclone',
                      'MEDICAL': '🏥 Medical',
                      'OTHER': '🚨 Other'
                    };
                    return options[value] || value;
                  }}
                >
                  <MenuItem value="FLOOD">🌊 Flood</MenuItem>
                  <MenuItem value="FIRE">🔥 Fire</MenuItem>
                  <MenuItem value="EARTHQUAKE">🌋 Earthquake</MenuItem>
                  <MenuItem value="LANDSLIDE">🏔️ Landslide</MenuItem>
                  <MenuItem value="CYCLONE">🌀 Cyclone</MenuItem>
                  <MenuItem value="MEDICAL">🏥 Medical</MenuItem>
                  <MenuItem value="OTHER">🚨 Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newReportForm.priority}
                  label="Priority"
                  onChange={(e) => setNewReportForm({...newReportForm, priority: e.target.value})}
                  renderValue={(value) => {
                    const options = {
                      'LOW': '🟢 Low',
                      'MEDIUM': '🟡 Medium',
                      'HIGH': '🔴 High',
                      'CRITICAL': '🚨 Critical'
                    };
                    return options[value] || value;
                  }}
                >
                  <MenuItem value="LOW">🟢 Low</MenuItem>
                  <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
                  <MenuItem value="HIGH">🔴 High</MenuItem>
                  <MenuItem value="CRITICAL">🚨 Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <div className="location-autocomplete" style={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Location"
                  value={newReportForm.address}
                  onChange={(e) => {
                    setNewReportForm({...newReportForm, address: e.target.value});
                    handleLocationSearch(e.target.value);
                  }}
                  placeholder="Start typing to search locations..."
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} />
                  }}
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleLocationSelect(suggestion)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: index < locationSuggestions.length - 1 ? '1px solid #eee' : 'none',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                          📍 {suggestion.address}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                          {suggestion.display_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {locationLoading && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '12px 16px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    🔍 Searching locations...
                  </div>
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                multiline
                rows={3}
                value={newReportForm.description}
                onChange={(e) => setNewReportForm({...newReportForm, description: e.target.value})}
                placeholder="Describe the emergency situation"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={fetchDescriptionSuggestions}
                  disabled={!newReportForm.disaster_type}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto'
                  }}
                >
                  AI Suggestions
                </Button>
              </Box>
              
              {/* AI Description Suggestions */}
              {showSuggestions && descriptionSuggestions && (
                <Box sx={{
                  bg: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  maxHeight: 300,
                  overflow: 'auto',
                  mt: 2
                }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🤖 AI Description Suggestions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose a suggestion to auto-fill the description:
                    </Typography>
                    {newReportForm.address && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                        📍 Location-aware suggestions for: {newReportForm.address}
                      </Typography>
                    )}
                  </Box>
                  {descriptionSuggestions.suggestions?.map((suggestion, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        borderBottom: index < descriptionSuggestions.suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          bg: '#f9fafb'
                        }
                      }}
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        {suggestion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {suggestion.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          size="small" 
                          label={`Confidence: ${Math.round(suggestion.confidence * 100)}%`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={suggestion.disaster_type}
                          color="secondary"
                          variant="outlined"
                        />
                        {suggestion.location && (
                          <Chip 
                            size="small" 
                            label={`📍 ${suggestion.location}`}
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button
                      size="small"
                      onClick={() => setShowSuggestions(false)}
                      sx={{ textTransform: 'none' }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Country</InputLabel>
                <Select
                  value={newReportForm.countryCode}
                  label="Country"
                  onChange={(e) => setNewReportForm({...newReportForm, countryCode: e.target.value})}
                  renderValue={(value) => {
                    const country = countryCodes.find(c => c.code === value);
                    return country ? country.display : value;
                  }}
                >
                  {countryCodes.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{country.flag}</span>
                        <span>{country.display}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                value={newReportForm.phone_number}
                onChange={(e) => setNewReportForm({...newReportForm, phone_number: e.target.value})}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} />
                }}
              />
            </Grid>
            
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  border: '2px dashed #d1d5db', 
                  borderRadius: 2, 
                  p: 2, 
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    background: '#f0f9ff'
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  console.log('🎯 Files dropped:', e.dataTransfer.files);
                  const fakeEvent = {
                    target: {
                      files: e.dataTransfer.files,
                      value: ''
                    }
                  };
                  handleImageSelect(fakeEvent);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  document.getElementById('image-upload').click();
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageSelect}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CloudUpload sx={{ fontSize: 32, color: '#6b7280' }} />
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    📸 Click to Upload Images or Drag & Drop
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    Supports JPG, PNG, GIF (max 10MB each)
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Image Preview Section */}
            {imagePreview.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 2, 
                  p: 2,
                  background: 'white'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                      📷 Selected Images ({imagePreview.length})
                    </Typography>
                    <Button
                      size="small"
                      onClick={clearAllImages}
                      sx={{ color: '#ef4444', fontSize: '0.75rem' }}
                    >
                      Clear All
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {imagePreview.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb'
                        }}
                      >
                        <img
                          src={preview.url}
                          alt={preview.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            background: 'rgba(239, 68, 68, 0.8)',
                            color: 'white',
                            width: 20,
                            height: 20,
                            '&:hover': {
                              background: '#ef4444'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setNewReportDialog(false)} 
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button 
            onClick={submitNewReport}
            variant="contained"
            size="small"
            disabled={!newReportForm.disaster_type || !newReportForm.description || !newReportForm.address || uploadingImages}
            sx={{
              background: '#ef4444',
              '&:hover': { background: '#dc2626' }
            }}
          >
            {uploadingImages ? 'Uploading...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compact View Report Dialog */}
      <Dialog 
        open={viewReportDialog} 
        onClose={() => setViewReportDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
            📋 Report Details
          </Typography>
          <IconButton 
            onClick={() => setViewReportDialog(false)} 
            size="small"
            sx={{ color: '#6b7280' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedReport && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={selectedReport.disaster_type} 
                  size="small"
                  color="primary"
                />
                <Chip 
                  label={selectedReport.priority} 
                  size="small"
                  color={getPriorityColor(selectedReport.priority)}
                />
                <Chip 
                  label={selectedReport.status} 
                  size="small"
                  color={getStatusColor(selectedReport.status)}
                />
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1, color: '#6b7280' }}>
                <strong>Location:</strong> {selectedReport.address}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1, color: '#6b7280' }}>
                <strong>Reporter:</strong> {selectedReport.user.first_name} {selectedReport.user.last_name}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1, color: '#6b7280' }}>
                <strong>Contact:</strong> {selectedReport.phone_number}
              </Typography>
              
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                <Typography variant="h6" sx={{ mb: 1, color: '#2c3e50', fontWeight: 'bold' }}>
                  🤖 AI Analysis Results
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    <strong>Confidence:</strong> {(selectedReport.ai_confidence * 100).toFixed(0)}%
                  </Typography>
                  {selectedReport.ai_fraud_score > 0.3 && (
                    <Typography variant="body2" sx={{ 
                      color: selectedReport.ai_fraud_score > 0.6 ? '#e74c3c' : '#f39c12',
                      fontWeight: 'bold'
                    }}>
                      <strong>Fraud Risk:</strong> {(selectedReport.ai_fraud_score * 100).toFixed(0)}%
                    </Typography>
                  )}
                </Box>
                
                {selectedReport.ai_analysis_data && selectedReport.ai_analysis_data.fraud_indicators && selectedReport.ai_analysis_data.fraud_indicators.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                      Fraud Indicators: {selectedReport.ai_analysis_data.fraud_indicators.join(', ')}
                    </Typography>
                  </Box>
                )}
                
                {selectedReport.ai_analysis_data && selectedReport.ai_analysis_data.emergency_indicators && selectedReport.ai_analysis_data.emergency_indicators.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#27ae60', fontWeight: 'bold' }}>
                      Emergency Keywords: {selectedReport.ai_analysis_data.emergency_indicators.join(', ')}
                    </Typography>
                  </Box>
                )}
                
                {selectedReport.ai_analysis_data && selectedReport.ai_analysis_data.analysis_version && (
                  <Typography variant="caption" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                    Analysis Version: {selectedReport.ai_analysis_data.analysis_version}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1, color: '#6b7280' }}>
                <strong>Description:</strong>
              </Typography>
              <Typography variant="body2" sx={{ 
                p: 2, 
                background: '#f8fafc', 
                borderRadius: 1,
                fontStyle: 'italic',
                color: '#4a5568',
                border: '1px solid #e2e8f0'
              }}>
                "{selectedReport.description}"
              </Typography>
              
              {/* Images in View Dialog */}
              {selectedReport.media && selectedReport.media.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#6b7280', fontWeight: 600 }}>
                    📸 Attached Images ({selectedReport.media.length}):
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {selectedReport.media.map((media, index) => (
                      <Box
                        key={media.id || index}
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            borderColor: '#3b82f6',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                          }
                        }}
                        onClick={() => {
                          let imageUrl = media.file;
                          if (!media.file.startsWith('http') && !media.file.startsWith('blob:')) {
                            imageUrl = `http://localhost:8000${media.file}`;
                          }
                          window.open(imageUrl, '_blank');
                        }}
                      >
                        <img
                          src={media.file.startsWith('http') || media.file.startsWith('blob:')
                            ? media.file 
                            : `http://localhost:8000${media.file}`}
                          alt={`Emergency image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onLoad={() => console.log('✅ Image loaded successfully:', media.file)}
                          onError={(e) => {
                            console.log('❌ Image failed to load:', media.file);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <Box sx={{
                          display: 'none',
                          width: '100%',
                          height: '100%',
                          background: '#f3f4f6',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '12px'
                        }}>
                          📷
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              <Typography variant="caption" sx={{ color: '#9ca3af', mt: 2, display: 'block' }}>
                Reported: {new Date(selectedReport.created_at).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setViewReportDialog(false)} 
            variant="outlined"
            size="small"
          >
            Close
          </Button>
          {canEditReport(selectedReport) ? (
            <Button 
              onClick={() => {
                setViewReportDialog(false);
                handleEditReport(selectedReport);
              }}
              variant="contained"
              size="small"
              sx={{
                background: '#f59e0b',
                '&:hover': { background: '#d97706' }
              }}
            >
              Edit
            </Button>
          ) : canUploadImages(selectedReport) ? (
            <Button 
              onClick={() => {
                setViewReportDialog(false);
                handleAddImages(selectedReport);
              }}
              variant="contained"
              size="small"
              sx={{
                background: '#4caf50',
                '&:hover': { background: '#45a049' }
              }}
            >
              Add Images
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      {/* Compact Edit Report Dialog */}
      <Dialog 
        open={editReportDialog} 
        onClose={() => setEditReportDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
            ✏️ Edit Report
          </Typography>
          <IconButton 
            onClick={() => setEditReportDialog(false)} 
            size="small"
            sx={{ color: '#6b7280' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Disaster Type</InputLabel>
                <Select
                  value={newReportForm.disaster_type}
                  label="Disaster Type"
                  onChange={(e) => setNewReportForm({...newReportForm, disaster_type: e.target.value})}
                  renderValue={(value) => {
                    const options = {
                      'FLOOD': '🌊 Flood',
                      'FIRE': '🔥 Fire', 
                      'EARTHQUAKE': '🌋 Earthquake',
                      'LANDSLIDE': '🏔️ Landslide',
                      'CYCLONE': '🌀 Cyclone',
                      'MEDICAL': '🏥 Medical',
                      'OTHER': '🚨 Other'
                    };
                    return options[value] || value;
                  }}
                >
                  <MenuItem value="FLOOD">🌊 Flood</MenuItem>
                  <MenuItem value="FIRE">🔥 Fire</MenuItem>
                  <MenuItem value="EARTHQUAKE">🌋 Earthquake</MenuItem>
                  <MenuItem value="LANDSLIDE">🏔️ Landslide</MenuItem>
                  <MenuItem value="CYCLONE">🌀 Cyclone</MenuItem>
                  <MenuItem value="MEDICAL">🏥 Medical</MenuItem>
                  <MenuItem value="OTHER">🚨 Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newReportForm.priority}
                  label="Priority"
                  onChange={(e) => setNewReportForm({...newReportForm, priority: e.target.value})}
                  renderValue={(value) => {
                    const options = {
                      'LOW': '🟢 Low',
                      'MEDIUM': '🟡 Medium',
                      'HIGH': '🔴 High',
                      'CRITICAL': '🚨 Critical'
                    };
                    return options[value] || value;
                  }}
                >
                  <MenuItem value="LOW">🟢 Low</MenuItem>
                  <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
                  <MenuItem value="HIGH">🔴 High</MenuItem>
                  <MenuItem value="CRITICAL">🚨 Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <div className="location-autocomplete" style={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Location"
                  value={newReportForm.address}
                  onChange={(e) => {
                    setNewReportForm({...newReportForm, address: e.target.value});
                    handleLocationSearch(e.target.value);
                  }}
                  placeholder="Start typing to search locations..."
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} />
                  }}
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleLocationSelect(suggestion)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: index < locationSuggestions.length - 1 ? '1px solid #eee' : 'none',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                          📍 {suggestion.address}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                          {suggestion.display_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {locationLoading && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '12px 16px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    🔍 Searching locations...
                  </div>
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                multiline
                rows={3}
                value={newReportForm.description}
                onChange={(e) => setNewReportForm({...newReportForm, description: e.target.value})}
                placeholder="Describe the emergency situation"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={fetchDescriptionSuggestions}
                  disabled={!newReportForm.disaster_type}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto'
                  }}
                >
                  AI Suggestions
                </Button>
              </Box>
              
              {/* AI Description Suggestions */}
              {showSuggestions && descriptionSuggestions && (
                <Box sx={{
                  bg: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  maxHeight: 300,
                  overflow: 'auto',
                  mt: 2
                }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🤖 AI Description Suggestions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose a suggestion to auto-fill the description:
                    </Typography>
                    {newReportForm.address && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                        📍 Location-aware suggestions for: {newReportForm.address}
                      </Typography>
                    )}
                  </Box>
                  {descriptionSuggestions.suggestions?.map((suggestion, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        borderBottom: index < descriptionSuggestions.suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          bg: '#f9fafb'
                        }
                      }}
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        {suggestion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {suggestion.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          size="small" 
                          label={`Confidence: ${Math.round(suggestion.confidence * 100)}%`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={suggestion.disaster_type}
                          color="secondary"
                          variant="outlined"
                        />
                        {suggestion.location && (
                          <Chip 
                            size="small" 
                            label={`📍 ${suggestion.location}`}
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button
                      size="small"
                      onClick={() => setShowSuggestions(false)}
                      sx={{ textTransform: 'none' }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Country</InputLabel>
                <Select
                  value={newReportForm.countryCode}
                  label="Country"
                  onChange={(e) => setNewReportForm({...newReportForm, countryCode: e.target.value})}
                  renderValue={(value) => {
                    const country = countryCodes.find(c => c.code === value);
                    return country ? country.display : value;
                  }}
                >
                  {countryCodes.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{country.flag}</span>
                        <span>{country.display}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                value={newReportForm.phone_number}
                onChange={(e) => setNewReportForm({...newReportForm, phone_number: e.target.value})}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} />
                }}
              />
            </Grid>
            
            {/* Image Upload Section for Edit */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  border: '2px dashed #d1d5db', 
                  borderRadius: 2, 
                  p: 2, 
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    background: '#f0f9ff'
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  console.log('🎯 Files dropped:', e.dataTransfer.files);
                  const fakeEvent = {
                    target: {
                      files: e.dataTransfer.files,
                      value: ''
                    }
                  };
                  handleImageSelect(fakeEvent);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  document.getElementById('image-upload-edit').click();
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload-edit"
                  multiple
                  type="file"
                  onChange={handleImageSelect}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CloudUpload sx={{ fontSize: 32, color: '#6b7280' }} />
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    📸 Add More Images or Drag & Drop
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    Supports JPG, PNG, GIF (max 10MB each)
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Image Preview Section for Edit */}
            {imagePreview.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 2, 
                  p: 2,
                  background: 'white'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                      📷 New Images ({imagePreview.length})
                    </Typography>
                    <Button
                      size="small"
                      onClick={clearAllImages}
                      sx={{ color: '#ef4444', fontSize: '0.75rem' }}
                    >
                      Clear All
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {imagePreview.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb'
                        }}
                      >
                        <img
                          src={preview.url}
                          alt={preview.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            background: 'rgba(239, 68, 68, 0.8)',
                            color: 'white',
                            width: 20,
                            height: 20,
                            '&:hover': {
                              background: '#ef4444'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
            
            {/* Existing Images Display */}
            {selectedReport && selectedReport.media && selectedReport.media.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 2, 
                  p: 2,
                  background: '#f8fafc'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1.5 }}>
                    📸 Current Images ({selectedReport.media.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedReport.media.map((media, index) => (
                      <Box
                        key={media.id || index}
                        sx={{
                          position: 'relative',
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            borderColor: '#3b82f6',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                          }
                        }}
                        onClick={() => {
                          let imageUrl = media.file;
                          if (!media.file.startsWith('http') && !media.file.startsWith('blob:')) {
                            imageUrl = `http://localhost:8000${media.file}`;
                          }
                          window.open(imageUrl, '_blank');
                        }}
                      >
                        <img
                          src={media.file.startsWith('http') || media.file.startsWith('blob:')
                            ? media.file 
                            : `http://localhost:8000${media.file}`}
                          alt={`Current image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <Box sx={{
                          display: 'none',
                          width: '100%',
                          height: '100%',
                          background: '#f3f4f6',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '12px'
                        }}>
                          📷
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
                    Click to view full size • Existing images cannot be removed in edit mode
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setEditReportDialog(false)} 
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button 
            onClick={submitEditReport}
            variant="contained"
            size="small"
            disabled={!newReportForm.disaster_type || !newReportForm.description || !newReportForm.address || uploadingImages}
            sx={{
              background: '#f59e0b',
              '&:hover': { background: '#d97706' }
            }}
          >
            {uploadingImages ? 'Updating...' : 'Update Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Images Only Dialog */}
      <Dialog 
        open={addImagesDialog} 
        onClose={() => setAddImagesDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📸 Add Images to Report
          </Typography>
          <IconButton 
            onClick={() => setAddImagesDialog(false)} 
            size="small"
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Grid container spacing={2}>
            {/* Report Info */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2, 
                border: '1px solid #e2e8f0' 
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📋 Report Details
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  <strong>Type:</strong> {selectedReport?.disaster_type} | 
                  <strong> Priority:</strong> {selectedReport?.priority} | 
                  <strong> Location:</strong> {selectedReport?.address}
                </Typography>
              </Box>
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  border: '2px dashed #d1d5db', 
                  borderRadius: 2, 
                  p: 2, 
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#4caf50',
                    background: '#f0f9f0'
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  console.log('🎯 Files dropped:', e.dataTransfer.files);
                  const fakeEvent = {
                    target: {
                      files: e.dataTransfer.files,
                      value: ''
                    }
                  };
                  handleImageSelect(fakeEvent);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  document.getElementById('image-upload-add').click();
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload-add"
                  multiple
                  type="file"
                  onChange={handleImageSelect}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CloudUpload sx={{ fontSize: 32, color: '#4caf50' }} />
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
                    📸 Click to Upload Images or Drag & Drop
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    Supports JPG, PNG, GIF (max 10MB each)
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Image Preview Section */}
            {imagePreview.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 2, 
                  p: 2,
                  background: 'white'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                      📷 New Images ({imagePreview.length})
                    </Typography>
                    <Button
                      size="small"
                      onClick={clearAllImages}
                      sx={{ color: '#ef4444', fontSize: '0.75rem' }}
                    >
                      Clear All
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {imagePreview.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb'
                        }}
                      >
                        <img
                          src={preview.url}
                          alt={preview.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: '#ef4444',
                            color: 'white',
                            width: 20,
                            height: 20,
                            '&:hover': { bgcolor: '#dc2626' }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setAddImagesDialog(false)} 
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button 
            onClick={submitImagesOnly}
            variant="contained"
            size="small"
            disabled={selectedImages.length === 0 || uploadingImages}
            sx={{
              background: '#4caf50',
              '&:hover': { background: '#45a049' }
            }}
          >
            {uploadingImages ? 'Uploading...' : `Add ${selectedImages.length} Image(s)`}
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
