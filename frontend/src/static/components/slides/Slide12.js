import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
} from '../styles/SlideStyles';
import styled from '@emotion/styled';
import PublicIcon from '@mui/icons-material/Public';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Styled components specific to this slide
const StatBox = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
  padding: '12px',
  textAlign: 'center',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
  },
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: 700,
  marginBottom: '2px',
  background: 'linear-gradient(90deg, #2c7da0, #2a9d8f)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const SummaryItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '14px',
}));

const SummaryIcon = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2c7da0, #2a9d8f)',
  color: 'white',
  width: '32px',
  height: '32px',
  minWidth: '32px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  marginRight: '12px',
  marginTop: '2px',
}));

const Acknowledgment = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(44, 125, 160, 0.1), rgba(42, 157, 143, 0.1))',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  marginTop: '20px',
}));

const Footer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  color: '#64748b',
  fontSize: '14px',
}));

const BuildingType = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
}));

const ColorBar = styled(Box)(({ color }) => ({
  width: '2px',
  height: '40px',
  backgroundColor: color,
  borderRadius: '4px',
  marginRight: '12px',
}));

const Slide12 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Summary & Key Takeaways
          </Typography>
          <GradientDivider />
        </Box>
        
        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatBox>
              <StatNumber>4</StatNumber>
              <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                Performance Requirements
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatBox>
              <StatNumber>5</StatNumber>
              <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                Verification Methods
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatBox>
              <StatNumber>9</StatNumber>
              <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                Parts in Section J
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatBox>
              <StatNumber>10</StatNumber>
              <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                Supporting Specifications
              </Typography>
            </StatBox>
          </Grid>
        </Grid>
        
        {/* Key Points */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2, display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ color: '#2563eb', mr: 1.5 }} />
            Key Points
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SummaryItem>
                <SummaryIcon>
                  <PublicIcon fontSize="small" />
                </SummaryIcon>
                <Typography variant="body1" sx={{ color: '#374151' }}>
                  The overall aim is to <Box component="span" sx={{ fontWeight: 500 }}>reduce greenhouse gas emissions</Box> from commercial buildings in Australia
                </Typography>
              </SummaryItem>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SummaryItem>
                <SummaryIcon>
                  <ThermostatIcon fontSize="small" />
                </SummaryIcon>
                <Typography variant="body1" sx={{ color: '#374151' }}>
                  Compliance reduces energy used to maintain comfortable temperature and operate the building
                </Typography>
              </SummaryItem>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SummaryItem>
                <SummaryIcon>
                  <StarIcon fontSize="small" />
                </SummaryIcon>
                <Typography variant="body1" sx={{ color: '#374151' }}>
                  Evidence of compliance is commonly provided through energy ratings (e.g., NatHERS 6★ minimum, 7★ average)
                </Typography>
              </SummaryItem>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SummaryItem>
                <SummaryIcon>
                  <DescriptionIcon fontSize="small" />
                </SummaryIcon>
                <Typography variant="body1" sx={{ color: '#374151' }}>
                  Other elements must be met using DTS Provisions or a compliant Performance Solution
                </Typography>
              </SummaryItem>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Different Requirements */}
        <Box sx={{ bgcolor: '#eff6ff', borderRadius: '8px', p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 2, display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ color: '#2563eb', mr: 1.5 }} />
            Different DTS Provisions Apply To:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <BuildingType>
                <ColorBar color="#3b82f6" />
                <Typography variant="body1" sx={{ color: '#374151' }}>
                  Sole-occupancy units in Class 2 buildings and Class 4 parts
                </Typography>
              </BuildingType>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BuildingType>
                <ColorBar color="#10b981" />
                <Typography variant="body1" sx={{ color: '#374151' }}>
                  Common areas and other Class 3 and 5-9 buildings
                </Typography>
              </BuildingType>
            </Grid>
          </Grid>
        </Box>
        
        {/* Acknowledgment */}
        <Acknowledgment>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
            Thank You
          </Typography>
          <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
            That brings our presentation on using the energy efficiency provisions in NCC Volume One to a close.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <OpenInNewIcon sx={{ color: '#2563eb', mr: 1 }} />
            <Typography variant="body1" sx={{ color: '#2563eb', fontWeight: 500 }}>
              For more information, please visit{' '}
              <Box component="a" href="https://abcb.gov.au" sx={{ textDecoration: 'underline' }}>
                abcb.gov.au
              </Box>
            </Typography>
          </Box>
        </Acknowledgment>
        
        <Footer>
          <Typography variant="body2">
            Energy Efficiency Provisions in NCC Volume One
          </Typography>
        </Footer>
      </Box>
      
      <SlideNumber>12 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide12; 