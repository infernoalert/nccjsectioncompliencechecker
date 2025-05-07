import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

const ELECTRICAL_API_URL = `${API_URL}/api/electrical`;

// Create axios instance with auth token
const axiosWithAuth = (token) => {
  if (!token) {
    throw new Error('No authentication token available');
  }
  return axios.create({
    baseURL: ELECTRICAL_API_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Generate electrical report
export const generateElectricalReport = createAsyncThunk(
  'electrical/generateReport',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get(`/${id}/report`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const electricalSlice = createSlice({
  name: 'electrical',
  initialState: {
    report: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateElectricalReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateElectricalReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(generateElectricalReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = electricalSlice.actions;
export default electricalSlice.reducer; 