import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';

const USERS_API_URL = `${API_URL}/users`;

// Create axios instance with auth header
const axiosWithAuth = (token) => {
    return axios.create({
        baseURL: USERS_API_URL,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Async thunks
export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;
            const response = await axiosWithAuth(token).get('/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createUser = createAsyncThunk(
    'user/createUser',
    async (userData, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;
            const response = await axiosWithAuth(token).post('/', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async ({ id, userData }, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;
            const response = await axiosWithAuth(token).put(`/${id}`, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (id, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;
            const response = await axiosWithAuth(token).delete(`/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    users: [],
    currentUser: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error?.message || 'Failed to fetch users';
            })
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.push(action.payload.data);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error?.message || 'Failed to create user';
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(user => user._id === action.payload.data._id);
                if (index !== -1) {
                    state.users[index] = action.payload.data;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error?.message || 'Failed to update user';
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(user => user._id !== action.payload.id);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error?.message || 'Failed to delete user';
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer; 