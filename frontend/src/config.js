// API URL configuration
const getApiUrl = () => {
  // Check if we're in production environment
  if (process.env.NODE_ENV === 'production') {
    // Check if we're on the ncc subdomain
    if (window.location.hostname === 'ncc.payamamerian.com') {
      return 'https://api.payamamerian.com';
    }
    return 'https://api.payamamerian.com';
  }
  // Default to development URL
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();
export const BASE_URL =
  process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3000';
