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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  createProject,
  updateProject,
  fetchProject,
  fetchBuildingTypes,
  fetchLocations,
} from '../store/slices/projectSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';

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

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      setUploadedFiles(currentProject.files || []);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }

    // Check file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // If we're creating a new project, store the file temporarily
      if (!id) {
        const tempFile = {
          filename: Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf',
          originalName: file.name,
          size: file.size,
          mimetype: file.type,
          file: file // Store the actual file object for later upload
        };
        setUploadedFiles(prev => [...prev, tempFile]);
      } else {
        // For existing projects, upload immediately
        const response = await axios.post(`/api/projects/${id}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadedFiles(prev => [...prev, response.data.data.file]);
      }
    } catch (error) {
      setUploadError(error.response?.data?.error || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (filename) => {
    try {
      await axios.delete(`/api/projects/${id}/files/${filename}`);
      setUploadedFiles(prev => prev.filter(file => file.filename !== filename));
    } catch (error) {
      setUploadError(error.response?.data?.error || 'Error deleting file');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (id) {
        await dispatch(updateProject({ id, data: formData })).unwrap();
      } else {
        // For new projects, first create the project
        const newProject = await dispatch(createProject(formData)).unwrap();
        
        // Then upload any pending files
        for (const file of uploadedFiles) {
          if (file.file) { // Check if this is a temporary file
            const formData = new FormData();
            formData.append('file', file.file);
            await axios.post(`/api/projects/${newProject._id}/upload`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          }
        }
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
      <Paper elevation={3} sx={{ p: 4 }}>
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

            {/* File Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Files
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  disabled={uploading}
                  startIcon={<PictureAsPdfIcon />}
                >
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </Button>
              </label>
              {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadError}
                </Alert>
              )}
            </Grid>
            <Grid item xs={12}>
              <List>
                {uploadedFiles.map((file) => (
                  <ListItem key={file.filename}>
                    <ListItemText
                      primary={file.originalName}
                      secondary={`Size: ${(file.size / 1024).toFixed(1)} KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleFileDelete(file.filename)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
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
