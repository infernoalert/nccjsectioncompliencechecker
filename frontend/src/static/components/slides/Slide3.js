import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
} from '../styles/SlideStyles';
import styled from '@emotion/styled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BoltIcon from '@mui/icons-material/Bolt';
import SolarPanelIcon from '@mui/icons-material/SolarPower';
import BusinessIcon from '@mui/icons-material/Business';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BuildIcon from '@mui/icons-material/Build';

// Styled components specific to this slide
const RequirementCard = styled(Box)(({ theme }) => ({
  borderRadius: '8px',
  overflow: 'hidden',
  transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)',
  },
}));

const ReqHeader = styled(Box)(({ theme, variant }) => ({
  padding: '12px 16px',
  color: 'white',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  background: variant === 'thermal' 
    ? 'linear-gradient(90deg, #2c7da0, #3d8daf)'
    : variant === 'energy'
    ? 'linear-gradient(90deg, #2a9d8f, #40b4a6)'
    : 'linear-gradient(90deg, #3a86a3, #4d97b3)',
}));

const ReqBody = styled(Box)(({ theme }) => ({
  padding: '16px',
  backgroundColor: 'white',
}));

const ListItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '8px',
}));

const EnvelopeItem = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}));

const Slide3 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Additional Performance Requirements
          </Typography>
          <GradientDivider />
        </Box>
        
        <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#374151', mb: 3 }}>
          Beyond J1P1, there are three additional Performance Requirements focused on specific building types:
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <RequirementCard>
              <ReqHeader variant="thermal">
                <ThermostatIcon sx={{ mr: 1 }} />
                <Typography>J1P2 Thermal Performance</Typography>
              </ReqHeader>
              <ReqBody>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Applies to sole-occupancy units of Class 2 buildings and Class 4 parts of buildings
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Focuses on ease of heat flow into and out of the building
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Reduces need for artificial heating and cooling
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Values for heating, cooling and total thermal loads provided in Specification 44
                  </Typography>
                </ListItem>
              </ReqBody>
            </RequirementCard>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <RequirementCard>
              <ReqHeader variant="energy">
                <BoltIcon sx={{ mr: 1 }} />
                <Typography>J1P3 Energy Usage</Typography>
              </ReqHeader>
              <ReqBody>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Applies to sole-occupancy units of Class 2 buildings and Class 4 parts of buildings
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Sets energy usage limits for common systems
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Provides maximum values for different heat pumps and water heaters
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Specifies lighting power density requirements
                  </Typography>
                </ListItem>
              </ReqBody>
            </RequirementCard>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <RequirementCard>
              <ReqHeader variant="renewable">
                <SolarPanelIcon sx={{ mr: 1 }} />
                <Typography>J1P4 Renewable Energy</Typography>
              </ReqHeader>
              <ReqBody>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Focused on future-proofing buildings
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Provides allowances for future onsite renewable energy generation equipment
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Facilitates electric vehicle charging infrastructure
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Makes retrofitting more cost-effective in commercial and high-rise buildings
                  </Typography>
                </ListItem>
              </ReqBody>
            </RequirementCard>
          </Grid>
        </Grid>
        
        <Box sx={{ backgroundColor: '#eff6ff', p: 3, borderRadius: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ color: '#2563eb', mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
              The Building Envelope in Section J
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
            For the purpose of Section J, the building envelope includes parts of a building's fabric that separate a conditioned space or habitable room from:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <EnvelopeItem>
                <OpenInNewIcon sx={{ color: '#059669', mr: 2 }} />
                <Typography>The exterior of the building</Typography>
              </EnvelopeItem>
            </Grid>
            <Grid item xs={12} md={6}>
              <EnvelopeItem>
                <WarehouseIcon sx={{ color: '#059669', mr: 2 }} />
                <Typography>Adjacent non-conditioned spaces (car parks, warehouses, etc.)</Typography>
              </EnvelopeItem>
            </Grid>
            <Grid item xs={12} md={6}>
              <EnvelopeItem>
                <AcUnitIcon sx={{ color: '#059669', mr: 2 }} />
                <Typography>Floor above a car park or warehouse</Typography>
              </EnvelopeItem>
            </Grid>
            <Grid item xs={12} md={6}>
              <EnvelopeItem>
                <BuildIcon sx={{ color: '#059669', mr: 2 }} />
                <Typography>Floor of rooftop plant room or lift machine room</Typography>
              </EnvelopeItem>
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      <SlideNumber>3 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide3; 