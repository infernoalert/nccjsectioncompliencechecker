import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { generateLightingPowerReport } from '../store/slices/lighting_power_reportSlice';

const LightingPowerReport = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { report, loading, error } = useSelector((state) => state.lightingPower);

  useEffect(() => {
    dispatch(generateLightingPowerReport(id));
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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lighting & Power Compliance Report
        </Typography>

        {report && (
          <Box sx={{ mt: 3 }}>
            {/* Project Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>Project Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1"><strong>Name:</strong> {report.projectInfo.name}</Typography>
                  <Typography variant="body1"><strong>Type:</strong> {report.projectInfo.buildingType}</Typography>
                  <Typography variant="body1"><strong>Location:</strong> {report.projectInfo.location}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1"><strong>Floor Area:</strong> {report.projectInfo.floorArea} m²</Typography>
                  <Typography variant="body1"><strong>Habitable Rooms Area:</strong> {report.projectInfo.totalAreaOfHabitableRooms} m²</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Building Classification & Climate Zone */}
            {report.buildingClassification && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>Building Classification & Climate Zone</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Classification:</strong> {report.buildingClassification.classType} - {report.buildingClassification.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{report.buildingClassification.description}</Typography>
                  </Grid>
                  {report.climateZone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1"><strong>Climate Zone:</strong> {report.climateZone.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{report.climateZone.description}</Typography>
                      {report.climateZone.annualHeatingDegreeHours !== undefined && (
                        <Typography variant="caption" display="block">Heating Degree Hours: {report.climateZone.annualHeatingDegreeHours}</Typography>
                      )}
                      {report.climateZone.annualCoolingDegreeHours !== undefined && (
                        <Typography variant="caption" display="block">Cooling Degree Hours: {report.climateZone.annualCoolingDegreeHours}</Typography>
                      )}
                      {report.climateZone.annualDehumidificationGramHours !== undefined && (
                        <Typography variant="caption" display="block">Dehumid. Gram Hours: {report.climateZone.annualDehumidificationGramHours}</Typography>
                      )}
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Dynamic Sections */}
            {report.lightingPowerReport.sections && report.lightingPowerReport.sections.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>Report Sections</Typography>
                {report.lightingPowerReport.sections.map((section, index) => (
                  <Box key={section.sectionId || index} sx={{ mb: 3 }}>
                    <Typography variant="h6">{section.title}</Typography>
                    {section.contentBlocks && section.contentBlocks.map((block, blockIndex) => (
                      <Box key={block.blockId || blockIndex} sx={{ mt: 2 }}>
                        {/* Render different content types */}
                        {block.contentType === 'text' && (
                          <Typography variant="body1">{block.content}</Typography>
                        )}
                        {block.contentType === 'table' && block.rows && (
                          <Box sx={{ mt: 2 }}>
                            {/* Add table rendering logic here */}
                            <Typography variant="body2">Table content will be rendered here</Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LightingPowerReport; 