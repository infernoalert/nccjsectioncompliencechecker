import React from 'react';
import { Box } from '@mui/material';
import LoginHeader from '../components/LoginHeader';
import SlideShow from './components/SlideShow';

const Presentation = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoginHeader />
      <Box sx={{ flex: 1, mt: 2 }}>
        <SlideShow />
      </Box>
    </Box>
  );
};

export default Presentation;
