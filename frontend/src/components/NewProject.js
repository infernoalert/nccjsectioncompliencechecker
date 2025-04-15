import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  useTheme,
  Chip
} from '@mui/material';
import { createProject, fetchBuildingTypes, fetchLocations } from '../store/slices/projectSlice';

const NewProject = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, buildingTypes, locations } = useSelector((state) => state.project);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buildingType: '',
    location: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchBuildingTypes()).unwrap();
        await dispatch(fetchLocations()).unwrap();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleBuildingTypeChange = (e) => {
    const buildingTypeId = e.target.value;
    
    // Find the selected building type for display purposes
    const selectedType = buildingTypes.find(type => type.id === buildingTypeId);
    console.log('Selected building type:', selectedType);
    
    // Set the selected building type state
    setSelectedBuildingType(selectedType);
    
    // Update form data with just the building type
    setFormData(prev => ({
      ...prev,
      buildingType: buildingTypeId
    }));
  };

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
      console.log('Submitting form data:', formData);
      await dispatch(createProject(formData)).unwrap();
      navigate('/projects');
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
              {typeof error === 'object' ? error.message : error}
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
                  onChange={handleBuildingTypeChange}
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
                      <Box>
                        <Typography variant="body1">{type.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedBuildingType && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    NCC Classification: Class {selectedBuildingType.nccClassification}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedBuildingType.commonFeatures && selectedBuildingType.commonFeatures.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

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
                      key={location.id} 
                      value={location.id}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    >
                      {location.name}, {location.state}
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