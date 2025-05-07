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
            {/* Lighting & Power Report Status */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>Lighting & Power Compliance</Typography>
              <Typography variant="body1" paragraph>
                {report.lightingPowerReport.message}
              </Typography>
              <Typography variant="body1">
                Status: {report.lightingPowerReport.status}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LightingPowerReport; 