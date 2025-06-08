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
} from '@mui/material';

const AddElectricalDetails = ({ open, onClose, onAdd, projectId, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'load',
    name: '',
    powerRating: '',
    voltage: '',
    current: '',
    deviceId: '',
    readingType: '',
    value: '',
    unit: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        name: initialData.name || '',
        powerRating: initialData.powerRating || '',
        voltage: initialData.voltage || '',
        current: initialData.current || '',
        deviceId: initialData.deviceId || '',
        readingType: initialData.readingType || '',
        value: initialData.value || '',
        unit: initialData.unit || '',
      });
    } else {
      setFormData({
        type: 'load',
        name: '',
        powerRating: '',
        voltage: '',
        current: '',
        deviceId: '',
        readingType: '',
        value: '',
        unit: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const data = {
      type: formData.type,
      ...(formData.type === 'load'
        ? {
            name: formData.name,
            powerRating: parseFloat(formData.powerRating),
            voltage: parseFloat(formData.voltage),
            current: parseFloat(formData.current),
          }
        : {
            deviceId: formData.deviceId,
            readingType: formData.readingType,
            value: parseFloat(formData.value),
            unit: formData.unit,
            timestamp: new Date().toISOString(),
          }),
    };

    onAdd(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Value' : 'Add Value'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
                disabled={!!initialData}
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
                  required
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
                  required
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
                  required
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device ID"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reading Type"
                  name="readingType"
                  value={formData.readingType}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Value"
                  name="value"
                  type="number"
                  value={formData.value}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddElectricalDetails; 