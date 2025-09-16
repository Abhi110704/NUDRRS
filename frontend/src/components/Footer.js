import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Email,
  Phone,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
  GitHub,
  Security,
  Gavel,
  Help
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        py: 3,
        mt: 'auto',
        width: '100%',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                  N
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  NUDRRS
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                  Emergency Response System
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem', lineHeight: 1.4 }}>
              National Urban Disaster Response and Reporting System
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, opacity: 0.9 }}>
              Quick Access
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Link 
                component={RouterLink}
                to="/" 
                color="inherit" 
                underline="none"
                sx={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.8,
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Dashboard
              </Link>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>•</Typography>
              <Link 
                component={RouterLink}
                to="/reports" 
                color="inherit" 
                underline="none"
                sx={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.8,
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Reports
              </Link>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>•</Typography>
              <Link 
                component={RouterLink}
                to="/analytics" 
                color="inherit" 
                underline="none"
                sx={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.8,
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Analytics
              </Link>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>•</Typography>
              <Link 
                component={RouterLink}
                to="/profile" 
                color="inherit" 
                underline="none"
                sx={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.8,
                  '&:hover': { opacity: 1, textDecoration: 'underline' }
                }}
              >
                Profile
              </Link>
            </Stack>
          </Grid>

          {/* Contact & Social */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, mb: 1 }}>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.7,
                  '&:hover': { 
                    opacity: 1,
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease'
                  }
                }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.7,
                  '&:hover': { 
                    opacity: 1,
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease'
                  }
                }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.7,
                  '&:hover': { 
                    opacity: 1,
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease'
                  }
                }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedIn fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.7,
                  '&:hover': { 
                    opacity: 1,
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease'
                  }
                }}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
              support@nudrrs.gov.in • +91-11-2345-6789
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
            © {currentYear} NUDRRS. All rights reserved.
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Link 
              component={RouterLink}
              to="/privacy" 
              color="inherit" 
              underline="none"
              sx={{ 
                fontSize: '0.7rem', 
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { opacity: 1, textDecoration: 'underline' }
              }}
            >
              <Security fontSize="inherit" />
              Privacy
            </Link>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>•</Typography>
            <Link 
              component={RouterLink}
              to="/terms" 
              color="inherit" 
              underline="none"
              sx={{ 
                fontSize: '0.7rem', 
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { opacity: 1, textDecoration: 'underline' }
              }}
            >
              <Gavel fontSize="inherit" />
              Terms
            </Link>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>•</Typography>
            <Link 
              component={RouterLink}
              to="/help" 
              color="inherit" 
              underline="none"
              sx={{ 
                fontSize: '0.7rem', 
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { opacity: 1, textDecoration: 'underline' }
              }}
            >
              <Help fontSize="inherit" />
              Support
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
