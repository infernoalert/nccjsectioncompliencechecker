import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import { fetchProject, generateReport } from '../store/slices/projectSlice';
import PrintIcon from '@mui/icons-material/Print';

// Import the new dynamic renderer
import DynamicSectionRenderer from './DynamicSectionRenderer';

const ProjectReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentProject, report, loading, error } = useSelector(state => state.project);

  // Get section from URL query params
  const queryParams = new URLSearchParams(location.search);
  const sectionParam = queryParams.get('section') || 'full'; // Use consistent naming

  useEffect(() => {
    dispatch(generateReport({ id, section: sectionParam }));
  }, [dispatch, id, sectionParam]); // Re-run if id or sectionParam changes

  const handleGenerateReport = () => {
    // Manually trigger report generation if needed
    dispatch(generateReport({ id, section: sectionParam }));
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Loading and Error States ---
  if (loading && !report) {
    // Show loading only if report isn't already loaded
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading report: {typeof error === 'object' ? error.message : error}
        </Alert>
      </Container>
    );
  }

  // --- Report Rendering ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            NCC Section J Compliance Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {/* Display project name if available */}
            Project: {report?.projectInfo?.name || currentProject?.name || `ID: ${id}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Generated on {new Date().toLocaleDateString()} {/* Consider adding time */}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Optional: Keep Refresh button if manual trigger is desired */}
            {/* <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateReport}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Refresh Report'}
                        </Button> */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={!report || loading}
            >
              Print Report
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Report Content Area */}
        {report ? (
          <>
            {/* --- Render Core/Static Sections --- */}
            {report.projectInfo && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Project Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {report.projectInfo.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Type:</strong> {report.projectInfo.buildingType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Location:</strong> {report.projectInfo.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Floor Area:</strong> {report.projectInfo.floorArea} m²
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Habitable Rooms Area:</strong>{' '}
                      {report.projectInfo.totalAreaOfHabitableRooms ?? 'N/A'} m²
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            {report.buildingClassification && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Building Classification & Climate Zone
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Classification:</strong> {report.buildingClassification.classType} -{' '}
                      {report.buildingClassification.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.buildingClassification.description}
                    </Typography>
                  </Grid>
                  {report.climateZone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Climate Zone:</strong> {report.climateZone.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.climateZone.description}
                      </Typography>
                      {/* Conditionally display extra climate data */}
                      {report.climateZone.annualHeatingDegreeHours !== undefined && (
                        <Typography variant="caption" display="block">
                          Heating Degree Hours: {report.climateZone.annualHeatingDegreeHours}
                        </Typography>
                      )}
                      {report.climateZone.annualCoolingDegreeHours !== undefined && (
                        <Typography variant="caption" display="block">
                          Cooling Degree Hours: {report.climateZone.annualCoolingDegreeHours}
                        </Typography>
                      )}
                      {report.climateZone.annualDehumidificationGramHours !== undefined && (
                        <Typography variant="caption" display="block">
                          Dehumid. Gram Hours: {report.climateZone.annualDehumidificationGramHours}
                        </Typography>
                      )}
                    </Grid>
                  )}
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            {/* Add other core sections like Compliance Pathway, Building Fabric if they are still static */}

            {/* Render J1P2 Calculations if present */}
            {report.j1p2calc && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  J1P2 Calculations
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(report.j1p2calc).map(([key, value]) => (
                    <Grid item xs={12} key={key}>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {value?.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Value:</strong> {value?.descriptionValue}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            {/* --- Render Dynamic Sections --- */}
            {report.dynamicSections && report.dynamicSections.length > 0 ? (
              report.dynamicSections.map(section => (
                <DynamicSectionRenderer key={section.sectionId} section={section} />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ my: 3 }}>
                No applicable dynamic sections found for this project or report view.
              </Typography>
            )}

            {/* --- REMOVED OLD HARDCODED SECTIONS --- */}
            {/* The specific JSX for rendering Exemptions, Energy Use, J3D3, */}
            {/* Elemental Provisions J3, Verification Methods etc. that was here */}
            {/* previously should be removed as it's now handled by DynamicSectionRenderer */}
          </>
        ) : (
          // Display message if report hasn't loaded or is empty
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Report Data Not Available
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please ensure the project ID is correct and try generating the report again.
                </Typography>
                <Button onClick={handleGenerateReport} sx={{ mt: 2 }}>
                  Retry
                </Button>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProjectReport;
