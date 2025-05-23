import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from '@mui/material';
import {
  createProject,
  updateProject,
  fetchProject,
  fetchBuildingTypes,
  fetchLocations,
} from '../store/slices/projectSlice';

/**
 * ProjectForm Component
 *
 * This component provides a form for editing project details. It includes:
 * - Basic project information (name, description, location)
 * - Building classification and climate zone selection
 * - Compliance pathway selection
 * - Building fabric specifications
 * - Special requirements
 *
 * The component handles both creation and editing of projects, with proper
 * validation and error handling.
 */
const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, loading, error, buildingTypes, locations } = useSelector(
    state => state.project
  );

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buildingType: '',
    location: '',
    floorArea: '',
    buildingFabric: {
      roof: '',
      externalWalls: '',
      floor: '',
      windows: '',
    },
    specialRequirements: [],
  });

  useEffect(() => {
    // Fetch building types and locations when component mounts
    dispatch(fetchBuildingTypes());
    dispatch(fetchLocations());

    if (id) {
      dispatch(fetchProject(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name || '',
        description: currentProject.description || '',
        buildingType: currentProject.buildingType || '',
        location: currentProject.location || '',
        floorArea: currentProject.floorArea || '',
        buildingFabric: currentProject.buildingFabric || {
          roof: '',
          externalWalls: '',
          floor: '',
          windows: '',
        },
        specialRequirements: currentProject.specialRequirements || [],
      });
    }
  }, [currentProject]);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name.startsWith('buildingFabric.')) {
      const fabricField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        buildingFabric: {
          ...prev.buildingFabric,
          [fabricField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (id) {
        await dispatch(updateProject({ id, data: formData })).unwrap();
      } else {
        await dispatch(createProject(formData)).unwrap();
      }
      navigate('/projects');
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{typeof error === 'object' ? error.message : error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Project' : 'New Project'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Building Type</InputLabel>
                <Select
                  name="buildingType"
                  value={formData.buildingType}
                  onChange={handleChange}
                  label="Building Type"
                >
                  {buildingTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  label="Location"
                >
                  {locations.map(location => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Floor Area (m²)"
                name="floorArea"
                type="number"
                value={formData.floorArea}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
                helperText="Enter the total floor area in square meters"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
            </Grid>

            {/* Building Fabric */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Building Fabric
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Roof"
                name="buildingFabric.roof"
                value={formData.buildingFabric.roof}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="External Walls"
                name="buildingFabric.externalWalls"
                value={formData.buildingFabric.externalWalls}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Floor"
                name="buildingFabric.floor"
                value={formData.buildingFabric.floor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Windows"
                name="buildingFabric.windows"
                value={formData.buildingFabric.windows}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/projects')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Save Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProjectForm;
