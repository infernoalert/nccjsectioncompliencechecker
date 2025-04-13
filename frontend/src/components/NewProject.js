import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const buildingTypes = [
  { id: 'apartment', label: 'Apartment buildings' },
  { id: 'hotel', label: 'Hotels, motels, boarding houses and guest houses' },
  { id: 'office', label: 'Office buildings and professional suites' },
  { id: 'retail', label: 'Shops, restaurants, and showrooms' },
  { id: 'carpark', label: 'Carparks and parking facilities' },
  { id: 'warehouse', label: 'Warehouses and storage facilities' },
  { id: 'factory', label: 'Factories, workshops and laboratories' },
  { id: 'healthcare', label: 'Hospitals and healthcare facilities' },
  { id: 'assembly', label: 'Schools, universities, theatres and public halls' },
  { id: 'agedcare', label: 'Aged care facilities and nursing homes' }
];

const NewProject = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buildingType: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/projects',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          mt: 4, 
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            mb: 4,
            textAlign: 'center'
          }}
        >
          Create New Project
        </Typography>
        <Paper 
          elevation={3}
          sx={{ 
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      backgroundColor: '#ffffff',
                      px: 0.5,
                    },
                    '& .MuiInputLabel-shrink': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    },
                  }}
                >
                  <InputLabel id="building-type-label">Building Type</InputLabel>
                  <Select
                    labelId="building-type-label"
                    name="buildingType"
                    value={formData.buildingType}
                    onChange={handleChange}
                    disabled={loading}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Please Select Building Type</em>
                    </MenuItem>
                    {buildingTypes.map((type) => (
                      <MenuItem 
                        key={type.id} 
                        value={type.id}
                        sx={{
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.contrastText,
                          },
                        }}
                      >
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid 
                item 
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 2
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !formData.name || !formData.buildingType}
                  sx={{
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress 
                      size={24} 
                      sx={{ 
                        color: theme.palette.primary.contrastText 
                      }}
                    />
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default NewProject; 