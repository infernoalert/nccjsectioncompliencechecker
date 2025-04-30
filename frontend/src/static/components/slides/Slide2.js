import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
  InfoBox
} from '../styles/SlideStyles';
import LeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import GlobeIcon from '@mui/icons-material/Public';
import HeartIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import PlugIcon from '@mui/icons-material/Power';
import SolarPanelIcon from '@mui/icons-material/SolarPower';
import CogsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import SpeedIcon from '@mui/icons-material/Speed';
import styled from '@emotion/styled';

// Styled components specific to this slide
const FeatureCard = styled(Box)(({ theme, color }) => ({
  borderLeft: `4px solid ${color}`,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '6px',
  padding: '14px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2c7da0 0%, #2a9d8f 100%)',
  color: 'white',
  width: '36px',
  height: '36px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  marginRight: '14px',
}));

const ObjectiveBox = styled(Box)(({ theme, color }) => ({
  backgroundColor: color === 'blue' ? '#eff6ff' : '#f0fdf4',
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
}));

const Slide2 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Energy Efficiency Performance Requirements
          </Typography>
          <GradientDivider />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#374151', mb: 2 }}>
            The overall objectives of the Performance Requirements in Section J are to:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <ObjectiveBox color="blue">
                <LeafIcon sx={{ color: '#2563eb', mr: 2 }} />
                <Typography sx={{ fontWeight: 500 }}>
                  Reduce energy consumption and peak energy demand
                </Typography>
              </ObjectiveBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <ObjectiveBox color="green">
                <GlobeIcon sx={{ color: '#059669', mr: 2 }} />
                <Typography sx={{ fontWeight: 500 }}>
                  Reduce greenhouse gas emissions
                </Typography>
              </ObjectiveBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <ObjectiveBox color="blue">
                <HeartIcon sx={{ color: '#2563eb', mr: 2 }} />
                <Typography sx={{ fontWeight: 500 }}>
                  Improve occupant health and amenity
                </Typography>
              </ObjectiveBox>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ 
          background: 'linear-gradient(to right, #eff6ff, #f0fdf4)', 
          borderRadius: '8px', 
          p: 2, 
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <BoltIcon sx={{ color: '#2563eb', mr: 1 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
              J1P1 Energy Use
            </Typography>
            <Typography variant="body2" sx={{ color: '#4b5563' }}>
              Applicable to all building classes, except sole-occupancy units of Class 2 buildings or Class 4 parts
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FeatureCard color="#2c7da0">
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FeatureIcon>
                  <PlugIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Energy Features
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Energy efficient appliances, electrical equipment, smart meters and renewable energy sources. Use of passive solar design to optimize heating and cooling.
                  </Typography>
                </Box>
              </Box>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FeatureCard color="#2a9d8f">
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FeatureIcon>
                  <SolarPanelIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Energy Source of Services
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Onsite renewable energy generation including wind, wave action and geothermal generation, but not "Greenpower" energy contracts.
                  </Typography>
                </Box>
              </Box>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FeatureCard color="#2c7da0">
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FeatureIcon>
                  <CogsIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Services
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Mechanical or electrical systems that use energy to provide air conditioning, ventilation, heated water, artificial lighting, vertical transport, etc. Excludes cooking facilities and portable appliances.
                  </Typography>
                </Box>
              </Box>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FeatureCard color="#2a9d8f">
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <FeatureIcon>
                  <HomeIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Sealing of Building Envelope
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Sealing between conditioned spaces and non-conditioned spaces to prevent unwanted entry or loss of heat.
                  </Typography>
                </Box>
              </Box>
            </FeatureCard>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, backgroundColor: '#dbeafe', p: 2, borderRadius: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SpeedIcon sx={{ color: '#1d4ed8', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Regulated Energy Consumption
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            The amount of energy consumed by a building's services minus the amount of renewable energy generated and used on site. Values vary based on building class.
          </Typography>
        </Box>
      </Box>
      
      <SlideNumber>2 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide2; 