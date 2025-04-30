import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
} from '../styles/SlideStyles';
import styled from '@emotion/styled';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Styled components specific to this slide
const InfoCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
  },
}));

const FeatureIcon = styled(Box)(({ theme, variant }) => ({
  width: '40px',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  marginRight: '14px',
  flexShrink: 0,
  background: variant === 'blue' 
    ? 'linear-gradient(135deg, #2c7da0, #3d8daf)'
    : 'linear-gradient(135deg, #2a9d8f, #3dbea8)',
  color: 'white',
}));

const ClimateExample = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f0f9ff, #e6f7ff)',
  borderRadius: '8px',
  borderLeft: '4px solid #2c7da0',
  padding: '16px',
}));

const StateRating = styled(Box)(({ theme, color }) => ({
  borderRadius: '6px',
  borderLeft: `3px solid ${color}`,
  backgroundColor: '#f9fafb',
  padding: '12px',
}));

const ListItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '4px',
}));

const Slide7 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Individual Heating & Cooling Loads
          </Typography>
          <GradientDivider />
        </Box>
        
        <Grid container spacing={4}>
          {/* Left column - Individual Cooling/Heating Loads */}
          <Grid item xs={12} md={6}>
            <InfoCard sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <FeatureIcon variant="blue">
                  <ThermostatIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Individual Heating & Cooling Loads
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Beyond total energy efficiency rating
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
                In mixed climate zones, buildings must meet <Box component="span" sx={{ fontWeight: 500 }}>individual cooling and heating load limits</Box> 
                in addition to the overall energy efficiency target.
              </Typography>
              
              <Box sx={{ backgroundColor: '#eff6ff', p: 2, borderRadius: '8px', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1f2937', mb: 1, display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ color: '#2563eb', mr: 1 }} />
                  Why Individual Load Limits Matter
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563' }}>
                  An SOU might perform well in winter (low heating load) but poorly in summer (high cooling load). 
                  Even if the combined rating meets the 6-star minimum, excessive cooling load would not comply with J1P2.
                </Typography>
              </Box>
              
              <ClimateExample>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1f2937', mb: 1 }}>
                  Load Limits Vary by Climate Zone
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  It is not reasonable to expect a building in Canberra (cooler climate) to use the same energy for heating as one in Brisbane (milder climate).
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e40af', textAlign: 'center' }}>
                        Canberra
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', fontSize: '0.875rem' }}>
                        7★ rating = higher heating load
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e40af', textAlign: 'center' }}>
                        Brisbane
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', fontSize: '0.875rem' }}>
                        7★ rating = lower heating load
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </ClimateExample>
            </InfoCard>
            
            <Box sx={{ backgroundColor: '#ecfdf5', p: 3, borderRadius: '8px', borderLeft: '4px solid #059669' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1f2937', mb: 1 }}>
                ABCB Standard 2022
              </Typography>
              <Typography variant="body2" sx={{ color: '#4b5563' }}>
                The ABCB Standard 2022, <Box component="span" sx={{ fontWeight: 500 }}>NatHERS heating and cooling load limits</Box>, contains the separate heating and cooling load limits that apply to designs assessed using the NCC's energy rating pathway.
              </Typography>
            </Box>
          </Grid>
          
          {/* Right column - Points of confusion */}
          <Grid item xs={12} md={6}>
            <InfoCard sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <FeatureIcon variant="green">
                  <WarningIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Points of Potential Confusion
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Understanding rating system differences
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1f2937', mb: 1 }}>
                  NatHERS vs NCC Climate Zones
                </Typography>
                <Box sx={{ backgroundColor: '#eff6ff', p: 2, borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#4b5563', mb: 1 }}>
                        When the NCC references a climate zone, it refers to one of the <Box component="span" sx={{ fontWeight: 500 }}>8 climate zones</Box> described in Schedule 1 Definitions.
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        NatHERS software uses a more detailed set of climate zones <Box component="span" sx={{ fontWeight: 500 }}>(69 as of 2021)</Box> that recognize additional climate differences, including wind patterns.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1f2937', mb: 2 }}>
                State/Territory Rating Systems
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <StateRating color="#2c7da0">
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#1f2937', mb: 0.5 }}>
                    ACT: Energy Efficiency Rating (EER)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <ListItem>
                      <ChevronRightIcon sx={{ color: '#2563eb', fontSize: '1rem', mt: 0.5, mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        Required for buildings being bought and sold
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ChevronRightIcon sx={{ color: '#2563eb', fontSize: '1rem', mt: 0.5, mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        New buildings can use NatHERS rating as the EER
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ChevronRightIcon sx={{ color: '#2563eb', fontSize: '1rem', mt: 0.5, mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        Existing buildings use different software (1-6 star scale)
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ChevronRightIcon sx={{ color: '#2563eb', fontSize: '1rem', mt: 0.5, mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        A 6★ EER ≠ 7★ NatHERS rating
                      </Typography>
                    </ListItem>
                  </Box>
                </StateRating>
                
                <StateRating color="#2a9d8f">
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#1f2937', mb: 0.5 }}>
                    NSW: BASIX
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <ListItem>
                      <ChevronRightIcon sx={{ color: '#059669', fontSize: '1rem', mt: 0.5, mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        Used for Class 2 SOUs and Class 4 parts of a building
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ChevronRightIcon sx={{ color: '#059669', fontSize: '1rem', mt: 0.5, mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        Provides the same level of performance as NatHERS 7★
                      </Typography>
                    </ListItem>
                  </Box>
                </StateRating>
              </Box>
              
              <Box sx={{ backgroundColor: '#fff7ed', p: 2, borderRadius: '8px', borderLeft: '4px solid #f97316' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LightbulbIcon sx={{ color: '#f97316', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>Important:</Box> Different rating systems cannot be substituted for building approval. Use the correct system for your jurisdiction and purpose.
                  </Typography>
                </Box>
              </Box>
            </InfoCard>
          </Grid>
        </Grid>
      </Box>
      
      <SlideNumber>7 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide7; 