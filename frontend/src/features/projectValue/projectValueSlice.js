import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3000/projects';

// Get all values for a project
export const getProjectValues = createAsyncThunk(
  'projectValue/getProjectValues',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/values`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch electrical values'
      );
    }
  }
);

// Create a new value
export const createProjectValue = createAsyncThunk(
  'projectValue/createProjectValue',
  async ({ projectId, valueData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}/values`, valueData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create electrical value'
      );
    }
  }
);

// Update a value
export const updateProjectValue = createAsyncThunk(
  'projectValue/updateProjectValue',
  async ({ projectId, valueId, valueData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}/values/${valueId}`,
        valueData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update electrical value'
      );
    }
  }
);

// Delete a value
export const deleteProjectValue = createAsyncThunk(
  'projectValue/deleteProjectValue',
  async ({ projectId, valueId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${projectId}/values/${valueId}`);
      return valueId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete electrical value'
      );
    }
  }
);

const initialState = {
  values: [],
  isLoading: false,
  error: null,
};

const projectValueSlice = createSlice({
  name: 'projectValue',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all values
      .addCase(getProjectValues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectValues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.values = action.payload;
      })
      .addCase(getProjectValues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create value
      .addCase(createProjectValue.fulfilled, (state, action) => {
        state.values.push(action.payload);
      })
      // Update value
      .addCase(updateProjectValue.fulfilled, (state, action) => {
        const index = state.values.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) {
          state.values[index] = action.payload;
        }
      })
      // Delete value
      .addCase(deleteProjectValue.fulfilled, (state, action) => {
        state.values = state.values.filter((v) => v._id !== action.payload);
      });
  },
});

export const { clearError } = projectValueSlice.actions;
export default projectValueSlice.reducer; 