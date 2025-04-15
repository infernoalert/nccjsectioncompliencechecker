import React, { useState, useEffect } from 'react';
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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { fetchProject } from '../store/slices/projectSlice';

/**
 * ProjectReport Component
 * 
 * This component generates a comprehensive compliance report for NCC Section J requirements.
 * It displays:
 * - Project details and metadata
 * - Building classification and climate zone information
 * - Compliance pathway details
 * - Building fabric specifications
 * - Special requirements and exemptions
 * - Compliance results with pass/fail status
 * - Documentation requirements and status
 * 
 * The report can be viewed on screen or downloaded as a PDF (future enhancement).
 */
const ProjectReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, loading, error } = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(fetchProject(id));
  }, [dispatch, id]);

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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            NCC Section J Compliance Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Generated on {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Project Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Project Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Project Name</Typography>
              <Typography variant="body1">{currentProject.name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Building Type</Typography>
              <Typography variant="body1">{currentProject.buildingType}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Location</Typography>
              <Typography variant="body1">{currentProject.location}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Owner</Typography>
              <Typography variant="body1">{currentProject.owner}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Building Classification and Climate Zone */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Building Classification & Climate Zone
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Building Classification</Typography>
              <Typography variant="body1">
                {currentProject.buildingClassification?.classType?.replace('Class_', '') || 'Not specified'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Climate Zone</Typography>
              <Typography variant="body1">
                {currentProject.climateZone?.name || 'Not specified'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Compliance Pathway */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Compliance Pathway
          </Typography>
          <Typography variant="body1">
            {currentProject.compliancePathway?.name || 'Not specified'}
          </Typography>
          {currentProject.compliancePathway?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {currentProject.compliancePathway.description}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Building Fabric */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Building Fabric Specifications
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Component</TableCell>
                  <TableCell>Specification</TableCell>
                  <TableCell>Compliance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentProject.buildingFabric?.map((fabric, index) => (
                  <TableRow key={index}>
                    <TableCell>{fabric.component}</TableCell>
                    <TableCell>{fabric.specification}</TableCell>
                    <TableCell>
                      <Typography
                        color={fabric.compliant ? 'success.main' : 'error.main'}
                      >
                        {fabric.compliant ? 'Compliant' : 'Non-compliant'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Special Requirements and Exemptions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Special Requirements & Exemptions
          </Typography>
          {currentProject.specialRequirements?.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Special Requirements
              </Typography>
              <ul>
                {currentProject.specialRequirements.map((req, index) => (
                  <li key={index}>
                    <Typography variant="body1">{req.description}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          ) : (
            <Typography variant="body1">No special requirements specified</Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Compliance Results */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Compliance Results
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Requirement</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentProject.complianceResults?.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.requirement}</TableCell>
                    <TableCell>
                      <Typography
                        color={result.passed ? 'success.main' : 'error.main'}
                      >
                        {result.passed ? 'Passed' : 'Failed'}
                      </Typography>
                    </TableCell>
                    <TableCell>{result.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Documentation */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Required Documentation
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentProject.documentation?.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>
                      <Typography
                        color={doc.provided ? 'success.main' : 'warning.main'}
                      >
                        {doc.provided ? 'Provided' : 'Pending'}
                      </Typography>
                    </TableCell>
                    <TableCell>{doc.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/projects/${id}`)}
          >
            Back to Project
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.print()}
          >
            Print Report
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectReport; 