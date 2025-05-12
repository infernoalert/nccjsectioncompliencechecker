import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Alert,
    CircularProgress,
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Search as SearchIcon,
    Upload as UploadIcon,
    Work as WorkIcon,
    Speed as SpeedIcon,
    Help as HelpIcon,
    Security as SecurityIcon,
    Update as UpdateIcon
} from '@mui/icons-material';
import LoginHeader from './LoginHeader';

const FeatureCard = ({ icon, title, description }) => {
    const Icon = icon;
    return (
        <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6" component="h3">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
        </Card>
    );
};

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        dispatch(login(formData));
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    const features = [
        {
            icon: SearchIcon,
            title: 'Instant NCC Guidance',
            description: 'Ask building-related questions and get immediate, accurate National Construction Code guidelines.'
        },
        {
            icon: UploadIcon,
            title: 'AI-Powered Interpretation',
            description: 'Upload technical documents and let our AI explain them in plain language. (Coming Soon)'
        },
        {
            icon: SpeedIcon,
            title: 'Smart Compliance Tools',
            description: 'Access intuitive tools that streamline your workflow and speed up project approvals.'
        },
        {
            icon: WorkIcon,
            title: 'Designed for Professionals',
            description: 'Built for architects, builders, engineers, and compliance officers.'
        },
        {
            icon: HelpIcon,
            title: 'How It Works',
            description: 'Simple three-step process: Ask questions, get answers, and soon upload documents for AI interpretation.'
        },
        {
            icon: SecurityIcon,
            title: 'Free to Use',
            description: 'Register now for free access to all current features and upcoming AI-powered tools.'
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            <LoginHeader />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8, flex: 1 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 4, 
                                borderRadius: 2,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
                            }}
                        >
                            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                                Sign in to access NCC compliance tools
                            </Typography>
                            {error && (
                                <Alert severity="error" onClose={handleClearError} sx={{ mb: 2 }}>
                                    {typeof error === 'object' ? error.message : error}
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
                                    variant="outlined"
                                    sx={{ mb: 2 }}
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
                                    variant="outlined"
                                    sx={{ mb: 3 }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    sx={{ 
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                                </Button>
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Not registered yet?{' '}
                                        <Link to="/register" style={{ 
                                            textDecoration: 'none', 
                                            color: theme.palette.primary.main,
                                            fontWeight: 'bold'
                                        }}>
                                            Create an account
                                        </Link>
                                    </Typography>
                                </Box>
                            </form>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                NCC Compliance Made Simple
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Your all-in-one platform for National Construction Code compliance
                            </Typography>
                        </Box>
                        <Grid container spacing={3}>
                            {features.map((feature, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <FeatureCard {...feature} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Login; 