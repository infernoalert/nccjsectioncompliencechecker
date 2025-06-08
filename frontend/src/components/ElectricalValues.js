import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';

const ElectricalValues = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [electricalData, setElectricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElectricalData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get(`/api/projects/${id}/electrical`, config);
        setElectricalData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch electrical data');
        setLoading(false);
        console.error('Error fetching electrical data:', err);
      }
    };

    if (token) {
      fetchElectricalData();
    }
  }, [id, token]);

  const getComplianceChipColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'non_compliant':
        return 'error';
      default:
        return 'warning';
    }
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
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!electricalData) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          No electrical data available for this project.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Electrical Values
        </Typography>

        {/* Compliance Status */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Compliance Status
          </Typography>
          <Chip
            label={electricalData?.complianceStatus?.toUpperCase() || 'PENDING'}
            color={getComplianceChipColor(electricalData?.complianceStatus)}
            sx={{ mr: 2 }}
          />
          {electricalData?.lastAssessmentDate && (
            <Typography variant="body2" color="text.secondary">
              Last Assessment: {format(new Date(electricalData.lastAssessmentDate), 'PPP')}
            </Typography>
          )}
        </Box>

        {/* Loads Table */}
        <Typography variant="h6" gutterBottom>
          Loads
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Power Rating (kW)</TableCell>
                <TableCell>Voltage (V)</TableCell>
                <TableCell>Current (A)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {electricalData?.loads?.map((load, index) => (
                <TableRow key={index}>
                  <TableCell>{load.name}</TableCell>
                  <TableCell>{load.type}</TableCell>
                  <TableCell>{load.powerRating}</TableCell>
                  <TableCell>{load.voltage}</TableCell>
                  <TableCell>{load.current}</TableCell>
                </TableRow>
              ))}
              {(!electricalData?.loads || electricalData.loads.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No loads data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Energy Monitoring Table */}
        <Typography variant="h6" gutterBottom>
          Energy Monitoring
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device ID</TableCell>
                <TableCell>Reading Type</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {electricalData?.energyMonitoring?.map((monitor, index) => (
                <TableRow key={index}>
                  <TableCell>{monitor.deviceId}</TableCell>
                  <TableCell>{monitor.readingType}</TableCell>
                  <TableCell>{monitor.value}</TableCell>
                  <TableCell>{monitor.unit}</TableCell>
                  <TableCell>
                    {format(new Date(monitor.timestamp), 'PPpp')}
                  </TableCell>
                </TableRow>
              ))}
              {(!electricalData?.energyMonitoring || electricalData.energyMonitoring.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No energy monitoring data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ElectricalValues; 