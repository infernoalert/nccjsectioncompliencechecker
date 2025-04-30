import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Presentation = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Presentation
        </Typography>
        <Typography variant="body1" paragraph>
          This is a static presentation page. You can add your content here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Presentation; 