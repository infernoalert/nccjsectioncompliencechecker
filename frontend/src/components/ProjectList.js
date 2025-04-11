import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { fetchProjects } from '../store/slices/projectSlice';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button
          component={Link}
          to="/projects/new"
          variant="contained"
          color="primary"
        >
          Create New Project
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Building Class</TableCell>
              <TableCell>Climate Zone</TableCell>
              <TableCell>Compliance Pathway</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Checked</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project._id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.buildingClassification.classType}</TableCell>
                <TableCell>{project.climateZone.zoneRange}</TableCell>
                <TableCell>{project.compliancePathway.name}</TableCell>
                <TableCell>
                  <Chip
                    label={project.complianceResults.status}
                    color={getStatusColor(project.complianceResults.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {project.complianceResults.lastChecked
                    ? new Date(project.complianceResults.lastChecked).toLocaleDateString()
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/projects/${project._id}`}
                    size="small"
                    color="primary"
                  >
                    View
                  </Button>
                  <Button
                    component={Link}
                    to={`/projects/${project._id}/edit`}
                    size="small"
                    color="secondary"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectList; 