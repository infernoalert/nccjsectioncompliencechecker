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
  Divider,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { generateElectricalReport } from '../store/slices/elec_reportSlice';

const ElectricalReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { report, loading, error } = useSelector((state) => state.electrical);

  useEffect(() => {
    dispatch(generateElectricalReport(id));
  }, [dispatch, id]);

  const handlePrint = () => {
    window.print();
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Electrical Compliance Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Project: {report?.projectInfo?.name || `ID: ${id}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Generated on {new Date().toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 2 }}>
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

        {/* Report Content */}
        {report ? (
          <Box>
            {/* Project Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>Project Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {report.projectInfo.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Building Type:</strong> {report.projectInfo.buildingType}
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
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Electrical Report Status */}
            <Box>
              <Typography variant="h5" gutterBottom>Electrical Compliance</Typography>
              <Typography variant="body1" color="text.secondary">
                {report.electricalReport.message}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Status: {report.electricalReport.status}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Report Data Not Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please ensure the project ID is correct and try generating the report again.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ElectricalReport; 