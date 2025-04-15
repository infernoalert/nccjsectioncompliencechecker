import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, clearError } from '../store/slices/userSlice';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';

const CreateUser = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.user);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createUser(formData));
        setFormData({ username: '', email: '', password: '' });
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Create New User
            </Typography>
            {error && (
                <Alert severity="error" onClose={handleClearError} sx={{ mb: 2 }}>
                    {typeof error === 'object' ? error.message : error}
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Create User'}
                </Button>
            </form>
        </Paper>
    );
};

export default CreateUser; 