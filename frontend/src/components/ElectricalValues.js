import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ElectricBolt as ElectricIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getProjectValues } from '../features/projectValue/projectValueSlice';

const ElectricalValues = ({ projectId }) => {
  const dispatch = useDispatch();
  const { values, isLoading, error } = useSelector((state) => state.projectValue);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('Fetching electrical values for project:', projectId);
    if (projectId) {
      dispatch(getProjectValues(projectId));
    }
  }, [dispatch, projectId, refreshKey]);

  useEffect(() => {
    console.log('Current state:', { values, isLoading, error });
  }, [values, isLoading, error]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <ElectricIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              Electrical Values
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {values && values.length > 0 ? (
          <Grid container spacing={2}>
            {values.map((value) => (
              <Grid item xs={12} sm={6} md={4} key={value._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {value.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      System Type: {value.systemType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Part Number: {value.partNumber}
                    </Typography>
                    {value.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {value.description}
                      </Typography>
                    )}
                    {value.manufacturer && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Manufacturer: {value.manufacturer}
                      </Typography>
                    )}
                    <Box mt={1}>
                      <Chip
                        label={value.status || 'active'}
                        color={value.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">No electrical values found for this project.</Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ElectricalValues; 