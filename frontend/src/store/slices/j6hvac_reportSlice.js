import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const j6hvac_API_URL = `${API_URL}/api/j6hvac`;

// Create axios instance with base URL
const api = axios.create({
  baseURL: j6hvac_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Generate J6 HVAC report
export const generateJ6hvacReport = createAsyncThunk(
  'J6hvac/generateReport',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/${projectId}/report`);
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to generate report';
      return rejectWithValue(errorMessage);
    }
  }
);

const J6hvacSlice = createSlice({
  name: 'J6hvac',
  initialState: {
    report: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(generateJ6hvacReport.pending, state => {
        state.loading = true;
        state.error = null;
        state.report = null;
      })
      .addCase(generateJ6hvacReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
        state.error = null;
      })
      .addCase(generateJ6hvacReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.report = null;
      });
  },
});

export const { clearError } = J6hvacSlice.actions;
export default J6hvacSlice.reducer; 