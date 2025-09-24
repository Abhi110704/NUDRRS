<<<<<<< HEAD
/**
 * API Configuration
 * Base URL for all API requests
 * Uses environment variable if available, otherwise falls back to production backend
 */
export const API_URL = process.env.REACT_APP_API_URL || 'https://nudrrs-backend.onrender.com';

// Axios default configuration
export const AXIOS_CONFIG = {
  withCredentials: true, // Important: This enables sending cookies with cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
};

// API Endpoints
=======
// frontend/src/config.js
export const API_URL = 'https://nudrrs-backend.onrender.com';

>>>>>>> 9bd2fc5a2ef16235263c77748b82f3d31e167958
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    PROFILE: '/api/auth/profile/',
    LOGOUT: '/api/auth/logout/',
<<<<<<< HEAD
    CHANGE_PASSWORD: '/api/auth/change-password/',
    RESET_PASSWORD: '/api/auth/reset-password/',
    VERIFY_OTP: '/api/auth/verify-otp/',
    RESET_CONFIRM: '/api/auth/reset-confirm/',
    CSRF: '/api/auth/get-csrf-token/',
  },
  REPORTS: {
    LIST: '/api/reports/',
    CREATE: '/api/reports/create/',
    DETAIL: (id) => `/api/reports/${id}/`,
    UPDATE: (id) => `/api/reports/${id}/update/`,
    DELETE: (id) => `/api/reports/${id}/delete/`,
  },
  RESOURCES: {
    LIST: '/api/resources/',
    UPLOAD: '/api/resources/upload/',
    DOWNLOAD: (id) => `/api/resources/${id}/download/`,
    DELETE: (id) => `/api/resources/${id}/delete/`,
  },
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard/',
    REPORTS_STATS: '/api/analytics/reports-stats/',
    USER_ACTIVITY: '/api/analytics/user-activity/',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications/',
    MARK_READ: (id) => `/api/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/api/notifications/mark-all-read/',
  },
  USERS: {
    LIST: '/api/users/',
    DETAIL: (id) => `/api/users/${id}/`,
    UPDATE_ROLE: (id) => `/api/users/${id}/update-role/`,
    DEACTIVATE: (id) => `/api/users/${id}/deactivate/`,
  },
  ORGANIZATIONS: {
    LIST: '/api/organizations/',
    CREATE: '/api/organizations/create/',
    DETAIL: (id) => `/api/organizations/${id}/`,
    UPDATE: (id) => `/api/organizations/${id}/update/`,
    DELETE: (id) => `/api/organizations/${id}/delete/`,
  },
};

// Default error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
};

// Default success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTER_SUCCESS: 'Registration successful! Please check your email to verify your account.',
  PASSWORD_RESET_SENT: 'Password reset link has been sent to your email.',
  PASSWORD_CHANGED: 'Your password has been changed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  REPORT_CREATED: 'Report created successfully!',
  REPORT_UPDATED: 'Report updated successfully!',
  REPORT_DELETED: 'Report deleted successfully!',
  RESOURCE_UPLOADED: 'File uploaded successfully!',
  RESOURCE_DELETED: 'File deleted successfully!',
};

// Default pagination settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

// File upload configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export default {
  API_URL,
  AXIOS_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  FILE_UPLOAD,
=======
  }
  // ... other endpoints
>>>>>>> 9bd2fc5a2ef16235263c77748b82f3d31e167958
};
