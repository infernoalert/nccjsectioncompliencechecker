import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const LIGHTING_POWER_API_URL = `${API_URL}/api/lighting-power`;

// Create axios instance with base URL
const api = axios.create({
  baseURL: LIGHTING_POWER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate lighting & power report
export const generateLightingPowerReport = createAsyncThunk(
  'lightingPower/generateReport',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/${projectId}/report`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

const lightingPowerSlice = createSlice({
  name: 'lightingPower',
  initialState: {
    report: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateLightingPowerReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateLightingPowerReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(generateLightingPowerReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = lightingPowerSlice.actions;
export default lightingPowerSlice.reducer; 