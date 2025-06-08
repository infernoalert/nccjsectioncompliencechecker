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
  Box,
  CircularProgress,
  Alert,
  Button,
  IconButton,
} from '@mui/material';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddElectricalDetails from './AddElectricalDetails';

const ElectricalValues = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingValue, setEditingValue] = useState(null);

  const fetchValues = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`/api/projects/${id}/values`, config);
      setValues(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch values');
      setLoading(false);
      console.error('Error fetching values:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchValues();
    }
  }, [id, token]);

  const handleAdd = async (data) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.post(`/api/projects/${id}/values`, data, config);
      fetchValues(); // Refresh data after adding
    } catch (err) {
      setError('Failed to add value');
      console.error('Error adding value:', err);
    }
  };

  const handleEdit = async (valueId, data) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.put(`/api/projects/${id}/values/${valueId}`, data, config);
      fetchValues(); // Refresh data after editing
      setEditingValue(null);
    } catch (err) {
      setError('Failed to update value');
      console.error('Error updating value:', err);
    }
  };

  const handleDelete = async (valueId) => {
    if (window.confirm('Are you sure you want to delete this value?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        await axios.delete(`/api/projects/${id}/values/${valueId}`, config);
        fetchValues(); // Refresh data after deleting
      } catch (err) {
        setError('Failed to delete value');
        console.error('Error deleting value:', err);
      }
    }
  };

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

  // Group values by type
  const loads = values.filter(v => v.type === 'load');
  const monitoring = values.filter(v => v.type === 'monitoring');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Project Values
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add Value
          </Button>
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
                <TableCell>Power Rating (kW)</TableCell>
                <TableCell>Voltage (V)</TableCell>
                <TableCell>Current (A)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loads.map((load) => (
                <TableRow key={load._id}>
                  <TableCell>{load.name}</TableCell>
                  <TableCell>{load.powerRating}</TableCell>
                  <TableCell>{load.voltage}</TableCell>
                  <TableCell>{load.current}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setEditingValue(load)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(load._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loads.length === 0 && (
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
                <TableCell>Device Type</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monitoring.map((monitor) => (
                <TableRow key={monitor._id}>
                  <TableCell>{monitor.deviceId}</TableCell>
                  <TableCell>{monitor.deviceType}</TableCell>
                  <TableCell>{monitor.model}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setEditingValue(monitor)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(monitor._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {monitoring.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No energy monitoring data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <AddElectricalDetails
        open={openAddDialog || editingValue !== null}
        onClose={() => {
          setOpenAddDialog(false);
          setEditingValue(null);
        }}
        onAdd={editingValue ? (data) => handleEdit(editingValue._id, data) : handleAdd}
        projectId={id}
        initialData={editingValue}
      />
    </Container>
  );
};

export default ElectricalValues; 