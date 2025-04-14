import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Alert,
    CircularProgress,
    Box
} from '@mui/material';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            dispatch(clearError());
            return;
        }
        const { confirmPassword, ...registerData } = formData;
        dispatch(register(registerData));
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" gutterBottom align="center">
                    Register
                </Typography>
                {error && (
                    <Alert severity="error" onClose={handleClearError} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
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
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                        helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? "Passwords don't match" : ""}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading || formData.password !== formData.confirmPassword}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Register'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Register; 