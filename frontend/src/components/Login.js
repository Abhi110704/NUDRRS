import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Container, Grid,
  Alert, CircularProgress, Divider, Chip, useTheme, useMediaQuery,
  FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import {
  Login as LoginIcon, PersonAdd, Security,
  Visibility, VisibilityOff, Email, Lock, Person, Phone
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    countryCode: '+91',
    phoneNumber: '',
    organization: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        // Validate required fields
        if (!formData.firstName.trim()) {
          setError('First name is required');
          setLoading(false);
          return;
        }
        if (!formData.lastName.trim()) {
          setError('Last name is required');
          setLoading(false);
          return;
        }
        if (!formData.username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        if (!formData.password.trim()) {
          setError('Password is required');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        // Map form data to backend serializer fields
        const registrationData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          password2: formData.confirmPassword,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone_number: `${formData.countryCode}${formData.phoneNumber}`,
          organization: formData.organization.trim()
        };
        
        await register(registrationData);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      countryCode: '+91',
      phoneNumber: '',
      organization: ''
    });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        <Paper sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Decoration */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            fontSize: '6rem',
            opacity: 0.05,
            transform: 'rotate(15deg)'
          }}>
            🚨
          </Box>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)',
              mb: 2,
              boxShadow: '0 8px 32px rgba(211, 47, 47, 0.3)'
            }}>
              <Security sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#d32f2f',
              mb: 1
            }}>
              NUDRRS
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: 'text.secondary',
              mb: 1
            }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {isLogin 
                ? 'Sign in to access the Emergency Response System'
                : 'Join the National Disaster Response Network'
              }
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {!isLogin && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
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
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Country</InputLabel>
                        <Select
                          value={formData.countryCode}
                          label="Country"
                          onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                          sx={{ height: '56px' }}
                        >
                          {countryCodes.map((country) => (
                            <MenuItem key={country.code} value={country.code}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {country.country}
                                </span>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        inputProps={{
                          maxLength: 10,
                          pattern: "^[0-9]{10}$"
                        }}
                        helperText="Enter 10-digit phone number"
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="e.g., NDRF, Police, Hospital, NGO"
                      inputProps={{
                        maxLength: 200
                      }}
                      InputProps={{
                        startAdornment: <Security sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    )
                  }}
                />
              </Grid>

              {!isLogin && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              )}

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b71c1c 0%, #e65100 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(211, 47, 47, 0.4)'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <>
                      {isLogin ? <LoginIcon sx={{ mr: 1 }} /> : <PersonAdd sx={{ mr: 1 }} />}
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* Forgot Password Link - Only show for login mode */}
          {isLogin && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="text"
                onClick={() => navigate('/password-reset')}
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#d32f2f' }
                }}
              >
                Forgot your password?
              </Button>
            </Box>
          )}

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Chip label="OR" />
          </Divider>

          {/* Toggle Mode */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              onClick={toggleMode}
              variant="text"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: '#d32f2f' }
              }}
            >
              {isLogin 
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"
              }
            </Button>
          </Box>

          {/* Footer Info */}
          <Box sx={{ 
            mt: 4, 
            p: 2, 
            backgroundColor: 'grey.50', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              🔒 Secure Emergency Response System
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              National Unified Disaster Response & Relief System
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
