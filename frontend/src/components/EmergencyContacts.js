import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Paper,
  TextField, InputAdornment, Button, Divider, Avatar,
  useTheme, useMediaQuery, Fade, Zoom, Container
} from '@mui/material';
import {
  Phone, LocationOn, Search, LocalHospital, FireTruck,
  LocalPolice, MedicalServices, Home, School, Business, Warning,
  Security, HealthAndSafety, DirectionsCar, ReportProblem
} from '@mui/icons-material';

const EmergencyContacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Comprehensive emergency contacts data
  const emergencyContacts = [
    // National Emergency Numbers
    {
      id: 1,
      name: 'National Emergency Number',
      number: '112',
      category: 'national',
      state: 'all',
      description: 'Single emergency number for police, fire, and medical emergencies',
      icon: <ReportProblem sx={{ color: '#ef4444' }} />,
      priority: 'critical'
    },
    {
      id: 2,
      name: 'Police Emergency',
      number: '100',
      category: 'police',
      state: 'all',
      description: 'Police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'critical'
    },
    {
      id: 3,
      name: 'Fire Emergency',
      number: '101',
      category: 'fire',
      state: 'all',
      description: 'Fire department emergency response',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'critical'
    },
    {
      id: 4,
      name: 'Medical Emergency',
      number: '108',
      category: 'medical',
      state: 'all',
      description: 'Ambulance and medical emergency services',
      icon: <MedicalServices sx={{ color: '#10b981' }} />,
      priority: 'critical'
    },
    {
      id: 5,
      name: 'Disaster Management',
      number: '108',
      category: 'disaster',
      state: 'all',
      description: 'National Disaster Response Force (NDRF)',
      icon: <Security sx={{ color: '#8b5cf6' }} />,
      priority: 'high'
    },

    // State-wise Emergency Contacts
    // Maharashtra
    {
      id: 6,
      name: 'Mumbai Police Control Room',
      number: '100',
      category: 'police',
      state: 'maharashtra',
      description: 'Mumbai police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 7,
      name: 'Mumbai Fire Brigade',
      number: '101',
      category: 'fire',
      state: 'maharashtra',
      description: 'Mumbai fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },
    {
      id: 8,
      name: 'Mumbai Ambulance',
      number: '108',
      category: 'medical',
      state: 'maharashtra',
      description: 'Mumbai medical emergency services',
      icon: <MedicalServices sx={{ color: '#10b981' }} />,
      priority: 'high'
    },

    // Delhi
    {
      id: 9,
      name: 'Delhi Police Control Room',
      number: '100',
      category: 'police',
      state: 'delhi',
      description: 'Delhi police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 10,
      name: 'Delhi Fire Service',
      number: '101',
      category: 'fire',
      state: 'delhi',
      description: 'Delhi fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },
    {
      id: 11,
      name: 'Delhi Ambulance',
      number: '108',
      category: 'medical',
      state: 'delhi',
      description: 'Delhi medical emergency services',
      icon: <MedicalServices sx={{ color: '#10b981' }} />,
      priority: 'high'
    },

    // Karnataka
    {
      id: 12,
      name: 'Bangalore Police Control Room',
      number: '100',
      category: 'police',
      state: 'karnataka',
      description: 'Bangalore police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 13,
      name: 'Bangalore Fire Service',
      number: '101',
      category: 'fire',
      state: 'karnataka',
      description: 'Bangalore fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },

    // Tamil Nadu
    {
      id: 14,
      name: 'Chennai Police Control Room',
      number: '100',
      category: 'police',
      state: 'tamil-nadu',
      description: 'Chennai police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 15,
      name: 'Chennai Fire Service',
      number: '101',
      category: 'fire',
      state: 'tamil-nadu',
      description: 'Chennai fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },

    // West Bengal
    {
      id: 16,
      name: 'Kolkata Police Control Room',
      number: '100',
      category: 'police',
      state: 'west-bengal',
      description: 'Kolkata police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 17,
      name: 'Kolkata Fire Service',
      number: '101',
      category: 'fire',
      state: 'west-bengal',
      description: 'Kolkata fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },

    // Gujarat
    {
      id: 18,
      name: 'Ahmedabad Police Control Room',
      number: '100',
      category: 'police',
      state: 'gujarat',
      description: 'Ahmedabad police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 19,
      name: 'Ahmedabad Fire Service',
      number: '101',
      category: 'fire',
      state: 'gujarat',
      description: 'Ahmedabad fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },

    // Rajasthan
    {
      id: 20,
      name: 'Jaipur Police Control Room',
      number: '100',
      category: 'police',
      state: 'rajasthan',
      description: 'Jaipur police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 21,
      name: 'Jaipur Fire Service',
      number: '101',
      category: 'fire',
      state: 'rajasthan',
      description: 'Jaipur fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },

    // Uttar Pradesh
    {
      id: 22,
      name: 'Lucknow Police Control Room',
      number: '100',
      category: 'police',
      state: 'uttar-pradesh',
      description: 'Lucknow police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 23,
      name: 'Lucknow Fire Service',
      number: '101',
      category: 'fire',
      state: 'uttar-pradesh',
      description: 'Lucknow fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },

    // Kerala
    {
      id: 24,
      name: 'Thiruvananthapuram Police Control Room',
      number: '100',
      category: 'police',
      state: 'kerala',
      description: 'Thiruvananthapuram police emergency response',
      icon: <LocalPolice sx={{ color: '#3b82f6' }} />,
      priority: 'high'
    },
    {
      id: 25,
      name: 'Thiruvananthapuram Fire Service',
      number: '101',
      category: 'fire',
      state: 'kerala',
      description: 'Thiruvananthapuram fire department',
      icon: <FireTruck sx={{ color: '#f97316' }} />,
      priority: 'high'
    },

    // Specialized Services
    {
      id: 26,
      name: 'Women Helpline',
      number: '181',
      category: 'specialized',
      state: 'all',
      description: 'Women safety and support helpline',
      icon: <Security sx={{ color: '#ec4899' }} />,
      priority: 'high'
    },
    {
      id: 27,
      name: 'Child Helpline',
      number: '1098',
      category: 'specialized',
      state: 'all',
      description: 'Child protection and support services',
      icon: <HealthAndSafety sx={{ color: '#06b6d4' }} />,
      priority: 'high'
    },
    {
      id: 28,
      name: 'Senior Citizen Helpline',
      number: '14567',
      category: 'specialized',
      state: 'all',
      description: 'Senior citizen support and emergency services',
      icon: <HealthAndSafety sx={{ color: '#8b5cf6' }} />,
      priority: 'medium'
    },
    {
      id: 29,
      name: 'Mental Health Helpline',
      number: '1800-599-0019',
      category: 'specialized',
      state: 'all',
      description: 'Mental health crisis support and counseling',
      icon: <HealthAndSafety sx={{ color: '#10b981' }} />,
      priority: 'high'
    },
    {
      id: 30,
      name: 'Railway Helpline',
      number: '139',
      category: 'transport',
      state: 'all',
      description: 'Railway emergency and security services',
      icon: <DirectionsCar sx={{ color: '#f59e0b' }} />,
      priority: 'medium'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: <ReportProblem /> },
    { value: 'national', label: 'National', icon: <Security /> },
    { value: 'police', label: 'Police', icon: <LocalPolice /> },
    { value: 'fire', label: 'Fire', icon: <FireTruck /> },
    { value: 'medical', label: 'Medical', icon: <MedicalServices /> },
    { value: 'disaster', label: 'Disaster', icon: <Warning /> },
    { value: 'specialized', label: 'Specialized', icon: <HealthAndSafety /> },
    { value: 'transport', label: 'Transport', icon: <DirectionsCar /> }
  ];

  const states = [
    { value: 'all', label: 'All States' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'tamil-nadu', label: 'Tamil Nadu' },
    { value: 'west-bengal', label: 'West Bengal' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
    { value: 'kerala', label: 'Kerala' }
  ];

  const filteredContacts = emergencyContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.number.includes(searchTerm) ||
                         contact.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    const matchesState = selectedState === 'all' || contact.state === 'all' || contact.state === selectedState;
    
    return matchesSearch && matchesCategory && matchesState;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#6b7280';
    }
  };

  const handleCall = (number) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              color: 'white', 
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              🚨 Emergency Contacts
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              maxWidth: 600, 
              mx: 'auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              Comprehensive directory of emergency services across India
            </Typography>
          </Box>
        </Fade>

        {/* Search and Filters */}
        <Fade in={true} timeout={1000}>
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search contacts, numbers, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#6b7280' }} />
                      </InputAdornment>
                    ),
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
                <TextField
                  fullWidth
                  select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'white'
                    }
                  }}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'white'
                    }
                  }}
                >
                  {states.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Quick Access Critical Numbers */}
        <Fade in={true} timeout={1200}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: 'white', 
              mb: 2,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              🚨 Critical Emergency Numbers
            </Typography>
            <Grid container spacing={2}>
              {emergencyContacts
                .filter(contact => contact.priority === 'critical')
                .map((contact, index) => (
                  <Grid item xs={12} sm={6} md={3} key={contact.id}>
                    <Zoom in={true} timeout={1400 + index * 100}>
                      <Card sx={{ 
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '2px solid #ef4444',
                        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(239, 68, 68, 0.3)'
                        }
                      }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar sx={{ 
                            width: 50, 
                            height: 50, 
                            mx: 'auto', 
                            mb: 1,
                            background: '#ef4444'
                          }}>
                            {contact.icon}
                          </Avatar>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: '#ef4444',
                            mb: 0.5
                          }}>
                            {contact.number}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#374151',
                            mb: 1
                          }}>
                            {contact.name}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleCall(contact.number)}
                            sx={{
                              background: '#ef4444',
                              '&:hover': { background: '#dc2626' },
                              borderRadius: 2
                            }}
                          >
                            <Phone sx={{ mr: 1 }} />
                            Call Now
                          </Button>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Fade>

        {/* All Emergency Contacts */}
        <Fade in={true} timeout={1600}>
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: 'white', 
              mb: 3,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              📞 All Emergency Services ({filteredContacts.length})
            </Typography>
            <Grid container spacing={3}>
              {filteredContacts.map((contact, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
                  <Zoom in={true} timeout={1800 + index * 50}>
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      border: `2px solid ${getPriorityColor(contact.priority)}`,
                      boxShadow: `0 8px 32px ${getPriorityColor(contact.priority)}20`,
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 40px ${getPriorityColor(contact.priority)}30`
                      }
                    }}>
                      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2,
                            background: getPriorityColor(contact.priority)
                          }}>
                            {contact.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 'bold', 
                              color: getPriorityColor(contact.priority),
                              fontSize: '1.1rem'
                            }}>
                              {contact.number}
                            </Typography>
                            <Chip 
                              label={contact.priority.toUpperCase()} 
                              size="small" 
                              sx={{ 
                                background: getPriorityColor(contact.priority),
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                              }} 
                            />
                          </Box>
                        </Box>
                        
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: '600', 
                          color: '#1f2937',
                          mb: 1
                        }}>
                          {contact.name}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280',
                          mb: 2,
                          flex: 1
                        }}>
                          {contact.description}
                        </Typography>
                        
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleCall(contact.number)}
                          sx={{
                            background: getPriorityColor(contact.priority),
                            '&:hover': { 
                              background: getPriorityColor(contact.priority),
                              filter: 'brightness(0.9)'
                            },
                            borderRadius: 2,
                            py: 1
                          }}
                        >
                          <Phone sx={{ mr: 1 }} />
                          Call {contact.number}
                        </Button>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* No Results */}
        {filteredContacts.length === 0 && (
          <Fade in={true} timeout={2000}>
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3
            }}>
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
                No emergency contacts found matching your criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedState('all');
                }}
              >
                Clear Filters
              </Button>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default EmergencyContacts;
