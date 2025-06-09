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
    type: 'load',
    name: '',
    powerRating: '',
    voltage: '',
    current: '',
    deviceId: '',
    deviceType: '',
    model: '',
  });

  useEffect(() => {
    if (editingValue) {
      setFormData({
        type: editingValue.type,
        name: editingValue.name || '',
        powerRating: editingValue.powerRating || '',
        voltage: editingValue.voltage || '',
        current: editingValue.current || '',
        deviceId: editingValue.deviceId || '',
        deviceType: editingValue.deviceType || '',
        model: editingValue.model || '',
      });
    } else {
      setFormData({
        type: 'load',
        name: '',
        powerRating: '',
        voltage: '',
        current: '',
        deviceId: '',
        deviceType: '',
        model: '',
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
    const data = {
      type: formData.type,
      ...(formData.type === 'load'
        ? {
            name: formData.name,
            powerRating: formData.powerRating ? parseFloat(formData.powerRating) : 0,
            voltage: formData.voltage ? parseFloat(formData.voltage) : 0,
            current: formData.current ? parseFloat(formData.current) : 0,
          }
        : {
            deviceId: formData.deviceId || '',
            deviceType: formData.deviceType || '',
            model: formData.model || '',
          }),
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
      <DialogTitle>{editingValue ? 'Edit Value' : 'Add Value'}</DialogTitle>
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
                disabled={!!editingValue}
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
                  label="Device ID"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required error={formData.type === 'monitoring' && !formData.deviceType}>
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    label="Device Type"
                  >
                    <MenuItem value="meter">Meter</MenuItem>
                    <MenuItem value="metermemory">Meter Memory</MenuItem>
                    <MenuItem value="smartmeter">Smart Meter</MenuItem>
                    <MenuItem value="authorithymeter">Authority Meter</MenuItem>
                  </Select>
                  {formData.type === 'monitoring' && !formData.deviceType && (
                    <FormHelperText error>Device Type is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
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