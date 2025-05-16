import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
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
import { generateJ6HvacReport, clearError } from '../../store/slices/j6hvac_reportSlice';
import PrintIcon from '@mui/icons-material/Print';
import DynamicSectionRenderer from '../DynamicSectionRenderer';

const J6HvacReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { report, loading, error } = useSelector(state => state.j6hvac);

  // Get section from URL query params
  const queryParams = new URLSearchParams(location.search);
  const sectionParam = queryParams.get('section') || 'full';

  useEffect(() => {
    dispatch(generateJ6HvacReport(id));

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id]);

  const handlePrint = () => {
    window.print();
  };

  // --- Loading and Error States ---
  if (loading && !report) {
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
            J6 HVAC Compliance Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Project: {report?.projectName || `ID: ${id}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Generated on {new Date().toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            {/* Project Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Project Information
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {report.projectName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Type:</strong> {report.buildingType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Location:</strong> {report.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Floor Area:</strong> {report.floorArea} m²
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Habitable Rooms Area:</strong>{' '}
                    {report.totalAreaOfHabitableRooms ?? 'N/A'} m²
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
            </Box>

            {/* Building Classification & Climate Zone */}
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

            {/* Dynamic Sections */}
            {report.sections && report.sections.length > 0 ? (
              report.sections.map(section => (
                <DynamicSectionRenderer key={section.sectionId} section={section} />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ my: 3 }}>
                No applicable sections found for this project or report view.
              </Typography>
            )}
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
              </>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default J6HvacReport; 