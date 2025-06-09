import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';

const AddElectricalDetails = ({ open, onClose, onSubmit, editingValue, onEdit }) => {
  const [formData, setFormData] = useState({
    type: 'monitoring',
    // Load fields
    name: '',
    powerRating: '',
    voltage: '',
    current: '',
    // Monitoring fields
    label: '',
    panel: '',
    deviceType: '',
    description: '',
    connection: '',
  });

  useEffect(() => {
    if (editingValue) {
      setFormData({
        type: editingValue.type,
        // Load fields
        name: editingValue.name || '',
        powerRating: editingValue.powerRating || '',
        voltage: editingValue.voltage || '',
        current: editingValue.current || '',
        // Monitoring fields
        label: editingValue.label || '',
        panel: editingValue.panel || '',
        deviceType: editingValue.type || '',
        description: editingValue.description || '',
        connection: editingValue.connection || '',
      });
    } else {
      setFormData({
        type: 'monitoring',
        // Load fields
        name: '',
        powerRating: '',
        voltage: '',
        current: '',
        // Monitoring fields
        label: '',
        panel: '',
        deviceType: '',
        description: '',
        connection: '',
      });
    }
  }, [editingValue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const data = formData.type === 'load'
      ? {
          type: 'load',
          name: formData.name,
          powerRating: formData.powerRating ? parseFloat(formData.powerRating) : 0,
          voltage: formData.voltage ? parseFloat(formData.voltage) : 0,
          current: formData.current ? parseFloat(formData.current) : 0,
        }
      : {
          type: formData.deviceType,
          label: formData.label,
          panel: formData.panel,
          description: formData.description || '',
          connection: formData.connection || ''
        };
    
    console.log('Prepared form data:', data);
    if (editingValue) {
      onEdit(editingValue._id, data);
    } else {
      onSubmit(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingValue ? 'Edit ' : 'Add '}
        {formData.type === 'load' ? 'Load' : 'Energy Monitoring Device'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
              >
                <MenuItem value="load">Load</MenuItem>
                <MenuItem value="monitoring">Energy Monitoring</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.type === 'load' ? (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Power Rating (kW)"
                  name="powerRating"
                  type="number"
                  value={formData.powerRating}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Voltage (V)"
                  name="voltage"
                  type="number"
                  value={formData.voltage}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Current (A)"
                  name="current"
                  type="number"
                  value={formData.current}
                  onChange={handleChange}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Label"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  required
                  placeholder="e.g., M1, SM1"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Panel"
                  name="panel"
                  value={formData.panel}
                  onChange={handleChange}
                  required
                  placeholder="e.g., MSSB-B-01N, TMP-3"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    label="Device Type"
                  >
                    <MenuItem value="smart meter">Smart Meter</MenuItem>
                    <MenuItem value="energy meter">Energy Meter</MenuItem>
                    <MenuItem value="power meter">Power Meter</MenuItem>
                    <MenuItem value="current transformer">Current Transformer</MenuItem>
                    <MenuItem value="voltage transformer">Voltage Transformer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Technical details about the device"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Connection"
                  name="connection"
                  value={formData.connection}
                  onChange={handleChange}
                  placeholder="Connection details (e.g., MCCB 100A, MSSB-B-01N)"
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {editingValue ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddElectricalDetails; 