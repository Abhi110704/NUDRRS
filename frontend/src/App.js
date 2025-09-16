import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import ReportsMap from './components/ReportsMap';
import Reports from './components/Reports';
import Analytics from './components/Analytics';
import EmergencyContacts from './components/EmergencyContacts';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import HelpSupport from './components/HelpSupport';

// Enhanced dark/light theme for disaster management system
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern blue
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed', // Modern purple
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    grey: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '-0.025em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0,0,0,0.05)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 32,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.02)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
              borderWidth: 2,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 4px 20px rgba(0,0,0,0.12)',
    '0 8px 30px rgba(0,0,0,0.16)',
    '0 16px 40px rgba(0,0,0,0.20)',
    '0 24px 60px rgba(0,0,0,0.24)',
    '0 32px 80px rgba(0,0,0,0.28)',
    '0 40px 100px rgba(0,0,0,0.32)',
    '0 48px 120px rgba(0,0,0,0.36)',
    '0 56px 140px rgba(0,0,0,0.40)',
    '0 64px 160px rgba(0,0,0,0.44)',
    '0 72px 180px rgba(0,0,0,0.48)',
    '0 80px 200px rgba(0,0,0,0.52)',
    '0 88px 220px rgba(0,0,0,0.56)',
    '0 96px 240px rgba(0,0,0,0.60)',
    '0 104px 260px rgba(0,0,0,0.64)',
    '0 112px 280px rgba(0,0,0,0.68)',
    '0 120px 300px rgba(0,0,0,0.72)',
    '0 128px 320px rgba(0,0,0,0.76)',
    '0 136px 340px rgba(0,0,0,0.80)',
    '0 144px 360px rgba(0,0,0,0.84)',
    '0 152px 380px rgba(0,0,0,0.88)',
    '0 160px 400px rgba(0,0,0,0.92)',
    '0 168px 420px rgba(0,0,0,0.96)',
    '0 176px 440px rgba(0,0,0,1.00)',
  ],
});

// Dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '-0.025em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(144, 202, 249, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255,255,255,0.1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 32,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.05)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#90caf9',
              borderWidth: 2,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#90caf9',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.3)',
    '0 4px 20px rgba(0,0,0,0.4)',
    '0 8px 30px rgba(0,0,0,0.5)',
    '0 16px 40px rgba(0,0,0,0.6)',
    '0 24px 60px rgba(0,0,0,0.7)',
    '0 32px 80px rgba(0,0,0,0.8)',
    '0 40px 100px rgba(0,0,0,0.85)',
    '0 48px 120px rgba(0,0,0,0.9)',
    '0 56px 140px rgba(0,0,0,0.95)',
    '0 64px 160px rgba(0,0,0,1.0)',
    '0 72px 180px rgba(0,0,0,1.0)',
    '0 80px 200px rgba(0,0,0,1.0)',
    '0 88px 220px rgba(0,0,0,1.0)',
    '0 96px 240px rgba(0,0,0,1.0)',
    '0 104px 260px rgba(0,0,0,1.0)',
    '0 112px 280px rgba(0,0,0,1.0)',
    '0 120px 300px rgba(0,0,0,1.0)',
    '0 128px 320px rgba(0,0,0,1.0)',
    '0 136px 340px rgba(0,0,0,1.0)',
    '0 144px 360px rgba(0,0,0,1.0)',
    '0 152px 380px rgba(0,0,0,1.0)',
    '0 160px 400px rgba(0,0,0,1.0)',
    '0 168px 420px rgba(0,0,0,1.0)',
    '0 176px 440px rgba(0,0,0,1.0)',
  ],
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) { 
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #d32f2f 0%, #ff9800 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚨</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>NUDRRS</div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>Loading Emergency System...</div>
        </div>
      </div>
    ); 
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) { return <div>Loading...</div>; }
  return isAuthenticated ? <Navigate to="/" /> : children;
};

function AppContent({ toggleTheme, isDarkMode }) {
  const { isAuthenticated } = useAuth();
  return (
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh' 
        }}>
          {isAuthenticated && <Navbar />}
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><ReportsMap /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/emergency-contacts" element={<ProtectedRoute><EmergencyContacts /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
          {isAuthenticated && <Footer />}
        </Box>
      </Router>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
