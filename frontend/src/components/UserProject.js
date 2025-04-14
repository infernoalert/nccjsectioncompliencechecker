import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const UserProject = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              My Projects
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
            >
              Create New Project
            </Button>
          </Box>
          
          {error && (
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : projects.length > 0 ? (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid xs={12} md={6} lg={4} key={project._id}>
                  <Paper elevation={2}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {project.buildingType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {project.status || 'Not Started'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated: {new Date(project.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                      <Button size="small" onClick={() => handleViewProject(project._id)}>
                        View Details
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your first project to get started
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{ mt: 2 }}
              >
                Create New Project
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UserProject; 