// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Export API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    PROFILE: '/api/auth/profile/',
    LOGOUT: '/api/auth/logout/',
  },
  // Add other API endpoints here
};
