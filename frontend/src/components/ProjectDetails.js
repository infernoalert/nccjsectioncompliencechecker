import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fetchProject, deleteProject } from '../store/slices/projectSlice';

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
          <Chip
            label={currentProject.status || 'In Progress'}
            color={currentProject.status === 'Completed' ? 'success' : 'warning'}
          />
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
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          {/* <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            Edit Project
          </Button> */}
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
