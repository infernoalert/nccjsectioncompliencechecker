import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { ElectricBolt as ElectricIcon } from '@mui/icons-material';
import ElectricalValues from '../components/ElectricalValues';

const ProjectDetails = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <ElectricIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h1">
            Electrical Information
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <ElectricalValues projectId={id} />
      </Paper>
    </Container>
  );
};

export default ProjectDetails; 