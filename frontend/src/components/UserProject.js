import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Grid, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fetchProjects } from '../store/slices/projectSlice';
import axios from 'axios';
import { API_URL } from '../config';

const UserProject = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector(state => state.project);
  const { token, isAuthenticated } = useSelector(state => state.auth);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    console.log('Auth State:', { token, isAuthenticated });
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    if (token) {
      console.log('Fetching projects with token:', token);
      dispatch(fetchProjects());
    } else {
      console.log('No token available');
    }
  }, [dispatch, token, isAuthenticated, navigate]);

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleViewProject = projectId => {
    navigate(`/projects/${projectId}/electrical-details`);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      await axios.delete(`${API_URL}/api/projects/${projectToDelete._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Refresh projects list
      dispatch(fetchProjects());
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      setDeleteError(error.response?.data?.error || 'Error deleting project');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
    setDeleteError(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
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
              {typeof error === 'object' ? error.message : error}
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : projects && projects.length > 0 ? (
            <Grid container spacing={3}>
              {projects.map(project => (
                <Grid item xs={12} md={6} lg={4} key={project._id}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, p: 1 }}>
                      <Button size="small" onClick={() => handleViewProject(project._id)}>
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleDeleteClick(project)}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.main',
                            color: 'white'
                          }
                        }}
                      >
                        Delete
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-project-dialog-title"
      >
        <DialogTitle id="delete-project-dialog-title">Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone and will permanently remove all project data, files, and electrical values.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProject;
