import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

const PROJECTS_API_URL = `${API_URL}/api/projects`;

// Get all values for a project
export const getProjectValues = createAsyncThunk(
  'projectValue/getProjectValues',
  async (projectId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${PROJECTS_API_URL}/${projectId}/values`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
  async ({ projectId, valueData }, { rejectWithValue, getState }) => {
    console.log('createProjectValue thunk called', { projectId, valueData });
    try {
      const { token } = getState().auth;
      let refId = null;
      let refType = null;
      let refDoc = null;
      if (valueData.type === 'load') {
        console.log('Calling API to create load', valueData);
        const loadRes = await axios.post(`${PROJECTS_API_URL}/load`, valueData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        refId = loadRes.data.data._id;
        refType = 'load';
        refDoc = loadRes.data.data;
      } else if (valueData.type === 'monitoring' || ['smart-meter', 'general-meter', 'auth-meter', 'memory-meter'].includes(valueData.monitoringDeviceType)) {
        console.log('Calling API to create energy monitoring device', valueData);
        const monitorRes = await axios.post(`${PROJECTS_API_URL}/energy-monitoring`, valueData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        refId = monitorRes.data.data._id;
        refType = 'monitoring';
        refDoc = monitorRes.data.data;
      }
      if (!refId) {
        console.log('No refId returned, aborting');
        return rejectWithValue('Failed to create referenced document');
      }
      console.log('Calling API to add reference to project', { refType, refId });
      const response = await axios.post(
        `${PROJECTS_API_URL}/${projectId}/values`,
        { type: refType, refId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Return the referenced document for UI
      return { ...refDoc, type: refType };
    } catch (error) {
      console.error('Error in createProjectValue thunk', error);
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create electrical value'
      );
    }
  }
);

// Update a value
export const updateProjectValue = createAsyncThunk(
  'projectValue/updateProjectValue',
  async ({ projectId, valueId, valueData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${PROJECTS_API_URL}/${projectId}/values/${valueId}`,
        valueData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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
  async ({ projectId, valueId }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.delete(`${PROJECTS_API_URL}/${projectId}/values/${valueId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { valueId, response: response.data };
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
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
      .addCase(deleteProjectValue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProjectValue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.values = state.values.filter((v) => v._id !== action.payload.valueId);
      })
      .addCase(deleteProjectValue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = projectValueSlice.actions;
export default projectValueSlice.reducer; 