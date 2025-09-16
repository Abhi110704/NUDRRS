/**
 * Time utility functions for NUDRRS
 * Handles Indian Standard Time (IST) formatting and calculations
 */

/**
 * Format a date string to show relative time (e.g., "2m ago", "1h ago")
 * with proper IST timezone handling
 * @param {string} dateString - ISO date string from backend
 * @returns {string} - Formatted relative time
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown time';
  
  try {
    // Handle different date formats and ensure UTC parsing
    let date;
    if (typeof dateString === 'string') {
      // If the string doesn't end with 'Z' or timezone info, add 'Z' to ensure UTC parsing
      const utcString = dateString.endsWith('Z') || dateString.includes('+') || dateString.includes('-') 
        ? dateString 
        : dateString + 'Z';
      date = new Date(utcString);
      
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid time';
    }
    
    // Get current time in UTC
    const now = new Date();
    
    // Calculate difference in seconds
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    
    // Return appropriate time format
    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    // For older dates, show the actual date in IST
    return formatISTDate(date);
  } catch (error) {
    console.warn('Error formatting time:', error, 'Date string:', dateString);
    return 'Invalid time';
  }
};

/**
 * Format a date to show in Indian Standard Time
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string in IST
 */
export const formatISTDate = (date) => {
  try {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  } catch (error) {
    console.warn('Error formatting IST date:', error);
    return 'Invalid date';
  }
};

/**
 * Get current time in IST
 * @returns {string} - Current time in IST format
 */
export const getCurrentISTTime = () => {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Convert UTC timestamp to IST
 * @param {string|Date} utcDate - UTC date string or Date object
 * @returns {Date} - Date object in IST
 */
export const convertUTCToIST = (utcDate) => {
  const date = new Date(utcDate);
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5:30 hours
};
