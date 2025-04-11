import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Get user from localStorage
const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

const tokenFromStorage = localStorage.getItem('token')
    ? localStorage.getItem('token')
    : null;

// Async thunks
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, userData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.get(`${API_URL}/me`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    user: userFromStorage,
    token: tokenFromStorage,
    loading: false,
    error: null,
    isAuthenticated: !!tokenFromStorage
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Registration failed';
            })
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Login failed';
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            // Get Current User
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to get user data';
            });
    }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 