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
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  Work as WorkIcon,
  Speed as SpeedIcon,
  Help as HelpIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
  AutoFixHigh as AutoFixHighIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import LoginHeader from './LoginHeader';

const FeatureCard = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-5px)' },
      }}
    >
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
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // Updated features array with your actual workflow and value propositions
  const features = [
    {
      icon: WorkIcon,
      title: 'Project-First Compliance',
      description:
        'Start by defining your project type (apartment, warehouse etc.) and location to get tailored NCC rules.',
    },
    {
      icon: SearchIcon,
      title: 'Precise NCC Filtering',
      description:
        'See only relevant clauses for your project - no more sifting through unrelated sections.',
    },
    {
      icon: SpeedIcon,
      title: 'Expert-Enhanced Sections',
      description:
        'Get engineer-reviewed explanations for J1/J2/J3/J7/J9 with practical compliance shortcuts.',
    },
    {
      icon: HelpIcon,
      title: 'How It Works',
      description:
        '1. Create project 2. Get filtered NCC rules 3. Use expert tools (AI analysis coming soon)',
    },
    {
      icon: UpdateIcon,
      title: 'Current Coverage',
      description:
        'J1 (General), J2 (Glazing), J3 (Building Fabric), J7 (Energy Monitoring), J9 (Electric Power)',
    },
    {
      icon: SecurityIcon,
      title: 'Free Access',
      description:
        'No-cost access to all current features. Built by NCC specialists for professionals.',
    },
  ];

  // Updated main header text (keep the same JSX structure, just change these strings)
  const headerTexts = {
    title: 'NCC Compliance Made Simple',
    subtitle: 'Your project-specific National Construction Code solution',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <LoginHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, flex: 1 }}>
        <Grid 
          container 
          spacing={4} 
          sx={{ 
            display: 'flex',
            alignItems: 'stretch'
          }}
        >
          <Grid 
            item 
            xs={12} 
            md={5} 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
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
                    fontSize: '1.1rem',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Not registered yet?{' '}
                    <Link
                      to="/register"
                      style={{
                        textDecoration: 'none',
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                      }}
                    >
                      Create an account
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Paper>
            <Grid 
              container 
              spacing={2} 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Grid item xs={12}>
                <FeatureCard
                  icon={AutoFixHighIcon}
                  title="AI Document Review (Coming Soon)"
                  description="Upload plans/specs for automatic NCC gap analysis and plain-English explanations."
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid 
            item 
            xs={12} 
            md={7} 
            sx={{ 
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
                NCC Compliance Made Simple
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your all-in-one platform for National Construction Code compliance
              </Typography>
            </Box>
            <Grid 
              container 
              spacing={3} 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {features.map((feature, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  key={index}
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
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
