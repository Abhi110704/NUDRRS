import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../config';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    // Set default base URL and credentials
    axios.defaults.withCredentials = true;
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}${API_ENDPOINTS.AUTH.PROFILE}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        // Token is invalid or expired
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        username,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      console.log('Sending registration data to:', `${API_URL}${API_ENDPOINTS.AUTH.REGISTER}`);
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.AUTH.REGISTER}`, userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.username) {
          errorMessage = `Username: ${error.response.data.username[0]}`;
        } else if (error.response.data.email) {
          errorMessage = `Email: ${error.response.data.email[0]}`;
        } else if (error.response.data.password) {
          errorMessage = `Password: ${error.response.data.password[0]}`;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUserProfile = async () => {
    if (token) {
      try {
        const response = await axios.get(`${API_URL}${API_ENDPOINTS.AUTH.PROFILE}`);
        setUser(response.data);
        return response.data;
      } catch (error) {
        console.error('Error refreshing user profile:', error);
        if (error.response?.status === 401) {
          logout();
        }
        return null;
      }
    }
    return null;
  };

  // Demo mode toggle removed for production

  const isAdmin = user?.profile?.role === 'ADMIN' || user?.is_superuser === true || user?.username === 'admin';
  const isManager = user?.profile?.role === 'MANAGER';
  const isResponder = user?.profile?.role === 'RESPONDER';
  const isAnalyst = user?.profile?.role === 'ANALYST';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUserProfile,
    // toggleDemoMode, // Removed for production
    isAuthenticated: !!token,
    isAdmin,
    isManager,
    isResponder,
    isAnalyst,
    userRole: user?.profile?.role || 'VIEWER'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
