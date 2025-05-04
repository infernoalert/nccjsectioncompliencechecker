import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Async thunks
export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.error);
    }
  }
);

export const revokeUserAccess = createAsyncThunk(
  'admin/revokeUserAccess',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/revoke`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.error);
    }
  }
);

export const restoreUserAccess = createAsyncThunk(
  'admin/restoreUserAccess',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/restore`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.error);
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
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
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Revoke Access
      .addCase(revokeUserAccess.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index].isActive = false;
        }
      })
      // Restore Access
      .addCase(restoreUserAccess.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index].isActive = true;
        }
      });
  }
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer; 