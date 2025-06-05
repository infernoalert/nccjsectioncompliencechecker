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
  Dialog,
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
  Close as CloseIcon,
} from '@mui/icons-material';
import LoginHeader from './LoginHeader';

const FeatureCard = ({ icon, title, description, onClick }) => {
  const Icon = icon;
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': { 
          transform: 'translateY(-5px)', 
          boxShadow: onClick ? 6 : undefined, 
          cursor: onClick ? 'pointer' : 'default' 
        },
      }}
      onClick={onClick}
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
  const [openVideo, setOpenVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

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

  const handleCardClick = (videoUrl) => {
    if (videoUrl) {
      let embedUrl = videoUrl;
      if (videoUrl.includes('youtu.be/')) {
        embedUrl = videoUrl.replace('youtu.be/', 'www.youtube.com/embed/');
      } else if (videoUrl.includes('watch?v=')) {
        embedUrl = videoUrl.replace('watch?v=', 'embed/');
      }
      setCurrentVideoUrl(embedUrl);
      setOpenVideo(true);
    }
  };

  const handleCloseVideo = () => {
    setOpenVideo(false);
    setCurrentVideoUrl('');
  };

  const features = [
    {
      icon: WorkIcon,
      title: 'Project-First Compliance',
      description:
        'Building in Australia! Dont Guess the Rules. Set your project type and location to get tailored NCC rules. ...Video',
      videoUrl: 'https://youtu.be/-1aAi-gaueM',
    },
    {
      icon: SearchIcon,
      title: 'Precision Tool',
      description:
        ' NCC Clarity, Tailored to You! Cut through the National Construction Code complexity. Get a precise view of your project regulations... Video',
      videoUrl: 'https://youtu.be/aHG_2Q5zSm4',
    },

    {
      icon: SpeedIcon,
      title: 'Expert-Enhanced Sections',
      description:
        'Get engineer-reviewed explanations with practical compliance shortcuts....Video',
        videoUrl: 'https://youtu.be/OtP7sHYy1co',
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
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 2, sm: 3, md: 4 }, 
          mb: { xs: 4, sm: 6, md: 8 }, 
          flex: 1,
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
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
              gap: { xs: 2, sm: 3 }
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
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
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body1" 
                align="center" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 2, sm: 3, md: 4 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
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
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
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
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
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
              spacing={{ xs: 1, sm: 2 }} 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 2 }
              }}
            >
            </Grid>
          </Grid>
          <Grid 
            item 
            xs={12} 
            md={7} 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <Box sx={{ mb: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                justifyContent: 'center'
              }}
            >
              {features.map((feature, index) => (
                <Grid 
                  item
                  xs={12}
                  sm={6}
                  key={index}
                  sx={{ display: 'flex' }}
                >
                  <FeatureCard
                    {...feature}
                    onClick={feature.videoUrl ? () => handleCardClick(feature.videoUrl) : undefined}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      {/* Video Dialog Popup */}
      <Dialog
        open={openVideo}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { position: 'relative', background: 'black' } }}
      >
        <IconButton
          aria-label="close"
          onClick={handleCloseVideo}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ position: 'relative', pt: '56.25%' }}>
          <iframe
            src={currentVideoUrl + '?autoplay=1'}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default Login;
