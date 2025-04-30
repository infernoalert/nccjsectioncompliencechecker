import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
} from '../styles/SlideStyles';
import styled from '@emotion/styled';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import InfoIcon from '@mui/icons-material/Info';

// Styled components specific to this slide
const RatingContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f9ff 0%, #edf8f7 100%)',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
}));

const RatingScale = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  margin: '30px 0 10px',
}));

const RatingBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  height: '8px',
  width: '100%',
  background: 'linear-gradient(90deg, #ff4e50 0%, #fcb69f 25%, #ffeaa7 50%, #a1c4fd 75%, #2a9d8f 100%)',
  borderRadius: '4px',
  zIndex: 0,
}));

const RatingMarker = styled(Box)(({ theme, active, left }) => ({
  width: '20px',
  height: '20px',
  backgroundColor: active ? '#2c7da0' : 'white',
  border: '2px solid #2c7da0',
  borderRadius: '50%',
  zIndex: 1,
  position: 'relative',
  left: `${left}%`,
  '&::after': {
    content: 'attr(data-label)',
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontWeight: 600,
    fontSize: '14px',
    color: '#2c7da0',
  },
}));

const ExampleBuilding = styled(Box)(({ theme }) => ({
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
}));

const ExampleHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2c7da0, #2a9d8f)',
  color: 'white',
  padding: '12px 16px',
  fontWeight: 600,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ExampleUnit = styled(Box)(({ theme, highlight }) => ({
  padding: '10px 16px',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: highlight ? '#eff6ff' : 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const ClimateZoneCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
  padding: '16px',
  borderLeft: '4px solid #2a9d8f',
}));

const StarRating = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& .star': {
    color: '#f59e0b',
    fontSize: '24px',
    margin: '0 2px',
  },
}));

const Slide6 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Energy Efficiency Ratings for SOUs/Apartments
          </Typography>
          <GradientDivider />
        </Box>
        
        <Grid container spacing={4}>
          {/* Left column - NatHERS assessment */}
          <Grid item xs={12} md={6}>
            <Box sx={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ color: '#2563eb', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  NatHERS Assessment
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ color: '#4b5563', mb: 3 }}>
                One way of meeting the heating and cooling load Performance Requirement J1P2 for an SOU/apartment is to 
                do a house energy rating, which assesses the thermal performance of the building fabric as a whole.
              </Typography>
              
              <RatingContainer>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#1f2937', mb: 1 }}>
                  NatHERS Star Rating System
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  The NatHERS rating system runs from 0 to 10 stars, with 10 stars being the most energy efficient.
                </Typography>
                
                <RatingScale>
                  <RatingBar />
                  <RatingMarker data-label="0" left={0} />
                  <RatingMarker data-label="2" left={20} />
                  <RatingMarker data-label="4" left={40} />
                  <RatingMarker data-label="6" left={60} />
                  <RatingMarker data-label="7" left={70} active />
                  <RatingMarker data-label="8" left={80} />
                  <RatingMarker data-label="10" left={100} />
                </RatingScale>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563eb' }}>
                        6★
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        Minimum for any individual SOU
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
                        7★
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        Minimum average across all SOUs in a building
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </RatingContainer>
            </Box>
            
            <ClimateZoneCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ThermostatIcon sx={{ color: '#059669', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  Climate Zone Requirements
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#4b5563' }}>
                Buildings/apartments in some climate zones must meet individual cooling and heating load limits specific to each climate zone. This applies in mixed climate zones where both heating and cooling are required at different times of the year.
              </Typography>
            </ClimateZoneCard>
          </Grid>
          
          {/* Right column - Example and additional info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ backgroundColor: '#eff6ff', p: 3, borderRadius: '8px', borderLeft: '4px solid #2563eb', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
                Example: 7★ Average Requirement
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', mb: 2 }}>
                For a complex with 4 SOUs, one could have a 6 star rating as long as the total ratings for the other 3 add up to at least 22 stars.
              </Typography>
              
              <ExampleBuilding>
                <ExampleHeader>
                  <Typography>Apartment Complex - 4 Units</Typography>
                  <Typography>Average: 7★</Typography>
                </ExampleHeader>
                <ExampleUnit>
                  <Typography>Unit 1</Typography>
                  <StarRating>
                    <Typography sx={{ mr: 1 }}>6</Typography>
                    <StarIcon className="star" />
                  </StarRating>
                </ExampleUnit>
                <ExampleUnit>
                  <Typography>Unit 2</Typography>
                  <StarRating>
                    <Typography sx={{ mr: 1 }}>7</Typography>
                    <StarIcon className="star" />
                  </StarRating>
                </ExampleUnit>
                <ExampleUnit>
                  <Typography>Unit 3</Typography>
                  <StarRating>
                    <Typography sx={{ mr: 1 }}>7</Typography>
                    <StarIcon className="star" />
                  </StarRating>
                </ExampleUnit>
                <ExampleUnit highlight>
                  <Typography>Unit 4</Typography>
                  <StarRating>
                    <Typography sx={{ mr: 1 }}>8</Typography>
                    <StarIcon className="star" />
                  </StarRating>
                </ExampleUnit>
                <Box sx={{ p: 2, backgroundColor: '#dbeafe', textAlign: 'center' }}>
                  <Typography sx={{ color: '#1e40af', fontWeight: 500 }}>
                    6 + 7 + 7 + 8 = 28 ÷ 4 = 7★ average
                  </Typography>
                </Box>
              </ExampleBuilding>
            </Box>
            
            <Box sx={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ color: '#2563eb', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  Important Notes on NatHERS Assessment
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Must use NatHERS accredited software tool and qualified assessor
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Once a star rating is completed and plans stamped, design changes require new rating
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    NatHERS rating alone doesn't satisfy J1P2 and J1P3 - must also comply with other DTS provisions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Working with a NatHERS assessor early in design process can identify cost-effective improvements
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <SlideNumber>6 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide6; 