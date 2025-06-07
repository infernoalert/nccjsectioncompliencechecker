import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Download as DownloadIcon,
  Draw as DrawIcon,
} from '@mui/icons-material';
import { fetchProject, deleteProject } from '../store/slices/projectSlice';
import axios from 'axios';

/**
 * ProjectDetails Component
 *
 * This component displays detailed information about a specific project and provides
 * access to related functionality such as:
 * - Viewing project details
 * - Editing project information
 * - Generating compliance reports
 * - Deleting projects
 *
 * The component integrates with Redux for state management and uses Material-UI
 * for the user interface.
 */
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, loading, error } = useSelector(state => state.project);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchProject(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteProject(id)).unwrap();
        navigate('/projects');
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const handleFileDownload = async (filename) => {
    try {
      const response = await axios.get(`/api/projects/${id}/files/${filename}`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
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
      const token = localStorage.getItem('token'); // Get the auth token
      const response = await axios.post(`/api/projects/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Add the auth token
        },
      });

      // Refresh project data to show new file
      dispatch(fetchProject(id));
    } catch (error) {
      setUploadError(error.response?.data?.error || 'Error uploading file');
    } finally {
      setUploading(false);
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

  if (!currentProject) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Project not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {currentProject.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                color="primary"
                component="span"
                startIcon={<PictureAsPdfIcon />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </Button>
            </label>
            {uploadError && (
              <Alert severity="error" sx={{ position: 'absolute', top: '100%', right: 0, mt: 1 }}>
                {uploadError}
              </Alert>
            )}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DrawIcon />}
              onClick={() => navigate(`/projects/${id}/diagram`)}
            >
              Draw Diagram
            </Button>
            <Chip
              label={currentProject.status || 'In Progress'}
              color={currentProject.status === 'Completed' ? 'success' : 'warning'}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Project Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Details
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Building Type:</strong> {currentProject.buildingType}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Building Classification:</strong>{' '}
                  {currentProject.buildingClassification?.classType || 'Not specified'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Location:</strong> {currentProject.location}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Floor Area:</strong>{' '}
                  {currentProject.floorArea ? `${currentProject.floorArea} m²` : 'Not specified'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance Information
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Compliance Pathway:</strong>{' '}
                  {currentProject.compliancePathway?.name || 'Not specified'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Last Updated:</strong>{' '}
                  {new Date(currentProject.updatedAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Created:</strong>{' '}
                  {new Date(currentProject.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Electrical Information
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                ) : currentProject?.electrical ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" component="div">
                        <strong>Compliance Status:</strong>{' '}
                      </Typography>
                      <Chip 
                        label={currentProject.electrical.complianceStatus} 
                        color={
                          currentProject.electrical.complianceStatus === 'compliant' ? 'success' :
                          currentProject.electrical.complianceStatus === 'non_compliant' ? 'error' :
                          'warning'
                        }
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Typography variant="body1" component="div" paragraph>
                      <strong>Last Assessment:</strong>{' '}
                      {currentProject.electrical.lastAssessmentDate ? 
                        new Date(currentProject.electrical.lastAssessmentDate).toLocaleDateString() : 
                        'Not assessed'}
                    </Typography>
                    <Typography variant="body1" component="div" paragraph>
                      <strong>Total Loads:</strong>{' '}
                      {currentProject.electrical.loads?.length || 0} loads
                    </Typography>
                    <Typography variant="body1" component="div" paragraph>
                      <strong>Energy Monitoring Points:</strong>{' '}
                      {currentProject.electrical.energyMonitoring?.length || 0} points
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AssessmentIcon />}
                      onClick={() => navigate(`/projects/${id}/electrical-details`)}
                      sx={{ mt: 1 }}
                    >
                      View Detailed Electrical Data
                    </Button>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No electrical data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Project Files Section */}
          {currentProject.files && currentProject.files.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Files
                  </Typography>
                  <List>
                    {currentProject.files.map((file) => (
                      <ListItem
                        key={file.filename}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="download"
                            onClick={() => handleFileDownload(file.filename)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <PictureAsPdfIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.originalName}
                          secondary={`Size: ${(file.size / 1024).toFixed(1)} KB • Uploaded: ${new Date(
                            file.uploadedAt
                          ).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate(`/projects/${id}/report`)}
          >
            Elemental Provisions
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate(`/j6hvac/${id}/report`)}
          >
            J6 HVAC
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate(`/j7lighting/${id}/report`)}
          >
            J7 Lighting & Power
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate(`/j9monitor/${id}/report`)}
          >
            J9 Energy Monitor
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Project
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectDetails;
