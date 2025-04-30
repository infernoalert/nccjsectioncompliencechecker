import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Slide1 from './slides/Slide1';
import Slide2 from './slides/Slide2';
import Slide3 from './slides/Slide3';
import Slide4 from './slides/Slide4';
import Slide5 from './slides/Slide5';
import Slide6 from './slides/Slide6';
import Slide7 from './slides/Slide7';
import Slide8 from './slides/Slide8';
import Slide9 from './slides/Slide9';
import Slide10 from './slides/Slide10';
import Slide11 from './slides/Slide11';
import Slide12 from './slides/Slide12';
import { NavigationButton } from './styles/SlideStyles';

const SlideShow = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 12;

  const handleNextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Function to render the current slide
  const renderCurrentSlide = () => {
    switch (currentSlide) {
      case 1:
        return <Slide1 />;
      case 2:
        return <Slide2 />;
      case 3:
        return <Slide3 />;
      case 4:
        return <Slide4 />;
      case 5:
        return <Slide5 />;
      case 6:
        return <Slide6 />;
      case 7:
        return <Slide7 />;
      case 8:
        return <Slide8 />;
      case 9:
        return <Slide9 />;
      case 10:
        return <Slide10 />;
      case 11:
        return <Slide11 />;
      case 12:
        return <Slide12 />;
      // Add more cases for other slides
      default:
        return <Slide1 />;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
        py: 4,
        px: 2,
        position: 'relative',
      }}
    >
      {currentSlide > 1 && (
        <NavigationButton 
          onClick={handlePrevSlide}
          sx={{ left: 20 }}
        >
          <ArrowBackIosNewIcon />
        </NavigationButton>
      )}
      
      {renderCurrentSlide()}
      
      {currentSlide < totalSlides && (
        <NavigationButton 
          onClick={handleNextSlide}
          sx={{ right: 20 }}
        >
          <ArrowForwardIosIcon />
        </NavigationButton>
      )}
    </Box>
  );
};

export default SlideShow; 