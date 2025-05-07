import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosWithAuth from '../../utils/axiosWithAuth';

// Generate electrical report
export const generateElectricalReport = createAsyncThunk(
  'electrical/generateReport',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get(`/api/electrical/${id}/report`);
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