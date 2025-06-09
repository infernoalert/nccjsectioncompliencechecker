import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddElectricalDetails from './AddElectricalDetails';
import {
  getProjectValues,
  createProjectValue,
  updateProjectValue,
  deleteProjectValue
} from '../features/projectValue/projectValueSlice';

const ElectricalValues = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { values, isLoading, error } = useSelector((state) => state.projectValue);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingValue, setEditingValue] = useState(null);

  useEffect(() => {
    dispatch(getProjectValues(id));
  }, [dispatch, id]);

  const handleAdd = async (data) => {
    try {
      const resultAction = await dispatch(createProjectValue({ projectId: id, valueData: data }));
      if (createProjectValue.fulfilled.match(resultAction)) {
        dispatch(getProjectValues(id));
      }
    } catch (err) {
      console.error('Error adding value:', err);
    }
  };

  const handleEdit = async (valueId, data) => {
    try {
      const resultAction = await dispatch(updateProjectValue({ 
        projectId: id, 
        valueId, 
        valueData: data 
      }));
      if (updateProjectValue.fulfilled.match(resultAction)) {
        dispatch(getProjectValues(id));
        setEditingValue(null);
      }
    } catch (err) {
      console.error('Error updating value:', err);
    }
  };

  const handleDelete = async (value) => {
    try {
      console.log('Deleting load:', value);
      const valueId = value._id;
      console.log('Attempting to delete value with ID:', valueId);
      
      const resultAction = await dispatch(deleteProjectValue({ 
        projectId: id, 
        valueId: valueId 
      }));

      if (deleteProjectValue.fulfilled.match(resultAction)) {
        dispatch(getProjectValues(id));
      } else {
        console.error('Error deleting value:', resultAction.error);
      }
    } catch (error) {
      console.error('Error deleting value:', error.message);
    }
  };

  const handleEditClick = (value) => {
    setEditingValue(value);
    setOpenAddDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setEditingValue(null);
  };

  if (isLoading) {
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
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Electrical Values
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
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Loads
        </Typography>
        <TableContainer component={Paper}>
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
                      onClick={() => handleEditClick(load)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(load)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Energy Monitoring Table */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
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
                      onClick={() => handleEditClick(monitor)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(monitor)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <AddElectricalDetails
        open={openAddDialog}
        onClose={handleCloseDialog}
        onSubmit={handleAdd}
        editingValue={editingValue}
        onEdit={handleEdit}
      />
    </Container>
  );
};

export default ElectricalValues; 