import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import { createProject } from '../store/slices/projectSlice';

const API_URL = 'http://localhost:5000/api';

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
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.project);
  const { token } = useSelector((state) => state.auth);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buildingType: '',
    location: ''
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_URL}/climate-zones`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Flatten all locations from all climate zones
        const allLocations = response.data.data.reduce((acc, zone) => {
          return [...acc, ...zone.locations];
        }, []);
        setLocations(allLocations.sort());
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    if (token) {
      fetchLocations();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createProject(formData)).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Project
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={loading}
              />
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
                <InputLabel id="buildingType-label">Building Type</InputLabel>
                <Select
                  labelId="buildingType-label"
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
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em>Please Select Location</em>
                  </MenuItem>
                  {locations.map((location) => (
                    <MenuItem 
                      key={location} 
                      value={location}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    >
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Project'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default NewProject; 