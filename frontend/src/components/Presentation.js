import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import LoginHeader from './LoginHeader';

const Presentation = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoginHeader />
      <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Presentation
          </Typography>
          <Typography variant="body1">
            This is the presentation page content.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Presentation; 