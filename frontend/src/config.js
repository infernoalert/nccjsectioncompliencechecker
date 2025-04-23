// API URL configuration
const getApiUrl = () => {
  // Check if we're in production environment
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.payamamerian.com/api';
  }
  // Default to development URL
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
export const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://nccjsectioncompliencechecker.vercel.app' 
  : 'http://localhost:3000'; 