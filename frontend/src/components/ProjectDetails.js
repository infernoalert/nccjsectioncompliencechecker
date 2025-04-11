import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { fetchProject, checkCompliance } from '../store/slices/projectSlice';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, loading, error } = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(fetchProject(id));
  }, [dispatch, id]);

  const handleCheckCompliance = async () => {
    try {
      await dispatch(checkCompliance(id)).unwrap();
    } catch (err) {
      console.error('Failed to check compliance:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!currentProject) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Project not found</Alert>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'non_compliant':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {currentProject.name}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/projects/${id}/edit`)}
              sx={{ mr: 2 }}
            >
              Edit Project
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCheckCompliance}
              disabled={loading}
            >
              Check Compliance
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Typography><strong>Description:</strong> {currentProject.description}</Typography>
            <Typography><strong>Building Class:</strong> {currentProject.buildingClassification?.name}</Typography>
            <Typography><strong>Climate Zone:</strong> {currentProject.climateZone?.name}</Typography>
            <Typography><strong>Compliance Pathway:</strong> {currentProject.compliancePathway?.name}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Building Fabric
            </Typography>
            <Typography><strong>Roof:</strong> {currentProject.buildingFabric.roof}</Typography>
            <Typography><strong>External Walls:</strong> {currentProject.buildingFabric.externalWalls}</Typography>
            <Typography><strong>Floor:</strong> {currentProject.buildingFabric.floor}</Typography>
            <Typography><strong>Windows:</strong> {currentProject.buildingFabric.windows}</Typography>
          </Grid>

          {currentProject.complianceResults && (
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Compliance Results
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(currentProject.complianceResults).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Chip
                        label={value.status}
                        color={getStatusColor(value.status)}
                        sx={{ mt: 1 }}
                      />
                      {value.message && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {value.message}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProjectDetails; 