import React from 'react';
import { Box, Typography, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
} from '../styles/SlideStyles';
import styled from '@emotion/styled';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import ShieldIcon from '@mui/icons-material/Shield';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

// Styled components specific to this slide
const MethodCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const MethodHeader = styled(Box)(({ theme, variant }) => ({
  borderRadius: '8px 8px 0 0',
  padding: '12px 15px',
  color: 'white',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  background: variant === 'nabers' 
    ? 'linear-gradient(90deg, #2c7da0, #4097bf)'
    : variant === 'green-star'
    ? 'linear-gradient(90deg, #2a9d8f, #3cbeb0)'
    : variant === 'reference'
    ? 'linear-gradient(90deg, #3a86a3, #5aa9c2)'
    : variant === 'sealing'
    ? 'linear-gradient(90deg, #2a9d8f, #3cbeb0)'
    : 'linear-gradient(90deg, #2c7da0, #4097bf)',
}));

const MethodBody = styled(Box)(({ theme }) => ({
  padding: '15px',
}));

const MethodIcon = styled(Box)(({ theme }) => ({
  width: '36px',
  height: '36px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  marginRight: '12px',
}));

const Badge = styled('span')(({ theme, variant }) => ({
  display: 'inline-flex',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
  marginRight: '4px',
  marginBottom: '4px',
  backgroundColor: variant === 'blue' 
    ? 'rgba(44, 125, 160, 0.1)' 
    : 'rgba(42, 157, 143, 0.1)',
  color: variant === 'blue' ? '#2c7da0' : '#2a9d8f',
  border: variant === 'blue' 
    ? '1px solid rgba(44, 125, 160, 0.2)' 
    : '1px solid rgba(42, 157, 143, 0.2)',
}));

const PartItem = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '12px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'center',
}));

const Slide9 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Energy Efficiency Assessment Methods
          </Typography>
          <GradientDivider />
        </Box>
        
        <Box sx={{ backgroundColor: '#eff6ff', p: 3, borderRadius: '8px', borderLeft: '4px solid #3b82f6', mb: 3 }}>
          <Typography variant="body1" sx={{ color: '#374151' }}>
            Whether you choose to use a DTS Solution or a Performance Solution or a combination of both, you may need to provide evidence 
            that the proposed solution complies with the Performance Requirements. For Section J Energy Efficiency, the NCC 
            provides 5 Verification Methods for assessing possible compliance solutions.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <InfoIcon sx={{ color: '#2563eb', mr: 1, fontSize: '1rem' }} />
            <Typography variant="body2" sx={{ color: '#1e40af' }}>
              Note: DTS Solutions can only be assessed with evidence of suitability and/or expert judgment.
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* J1V1 NABERS Energy */}
          <Grid item xs={12} md={4}>
            <MethodCard>
              <MethodHeader variant="nabers">
                <MethodIcon>
                  <TrendingUpIcon />
                </MethodIcon>
                <Typography variant="h6">J1V1 NABERS Energy</Typography>
              </MethodHeader>
              <MethodBody>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                  <Badge variant="blue">Class 3</Badge>
                  <Badge variant="blue">Class 5</Badge>
                  <Badge variant="blue">Class 6</Badge>
                  <Badge variant="blue">Class 2 common areas</Badge>
                </Box>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Verifies the energy efficiency of the whole building (excluding SOUs in Class 2).
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Energy modeling framework on a 6-star scale"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Additional thermal comfort requirements apply"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                </List>
              </MethodBody>
            </MethodCard>
          </Grid>
          
          {/* J1V2 Green Star */}
          <Grid item xs={12} md={4}>
            <MethodCard>
              <MethodHeader variant="green-star">
                <MethodIcon>
                  <StarIcon />
                </MethodIcon>
                <Typography variant="h6">J1V2 Green Star</Typography>
              </MethodHeader>
              <MethodBody>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                  <Badge variant="green">Class 3, 5-9</Badge>
                  <Badge variant="green">Class 2 common areas</Badge>
                </Box>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Compares the proposed building to a reference building compliant with DTS Provisions.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Will exceed minimum energy efficiency requirements"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Additional DTS Provisions still apply"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                </List>
              </MethodBody>
            </MethodCard>
          </Grid>
          
          {/* J1V3 Reference Building */}
          <Grid item xs={12} md={4}>
            <MethodCard>
              <MethodHeader variant="reference">
                <MethodIcon>
                  <BusinessIcon />
                </MethodIcon>
                <Typography variant="h6">J1V3 Reference Building</Typography>
              </MethodHeader>
              <MethodBody>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                  <Badge variant="blue">Class 3, 5-9</Badge>
                  <Badge variant="blue">Class 2 common areas</Badge>
                </Box>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Compares annual greenhouse gas emissions of proposed building to a reference building.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reference building based on DTS Provisions"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Emissions must not exceed reference building"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                </List>
              </MethodBody>
            </MethodCard>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* J1V4 Building Envelope Sealing */}
          <Grid item xs={12} md={6}>
            <MethodCard>
              <MethodHeader variant="sealing">
                <MethodIcon>
                  <ShieldIcon />
                </MethodIcon>
                <Typography variant="h6">J1V4 Building Envelope Sealing</Typography>
              </MethodHeader>
              <MethodBody>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                  <Badge variant="green">Class 2, 3, 4, 5, 6, 8, 9</Badge>
                </Box>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Demonstrates compliance with building sealing requirements only - not other energy efficiency aspects.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Alternative to prescriptive building sealing in Part J5"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Demonstrates compliance with J1P1(e)"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                </List>
              </MethodBody>
            </MethodCard>
          </Grid>
          
          {/* J1V5 Reference Building for SOUs */}
          <Grid item xs={12} md={6}>
            <MethodCard>
              <MethodHeader variant="sou">
                <MethodIcon>
                  <HomeIcon />
                </MethodIcon>
                <Typography variant="h6">J1V5 Reference Building for Class 2 SOUs</Typography>
              </MethodHeader>
              <MethodBody>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                  <Badge variant="blue">Class 2 sole-occupancy units only</Badge>
                </Box>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Compares heating and cooling loads of proposed building to a reference building.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Satisfies J1P2 if heating/cooling loads don't exceed reference"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="J1P3 satisfied by comparing energy usage (J1V5(2))"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Additional requirements in specifications 33 and 45"
                      primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                    />
                  </ListItem>
                </List>
              </MethodBody>
            </MethodCard>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 'auto', pt: 3 }}>
          <Box sx={{ background: 'linear-gradient(90deg, #eff6ff, #ecfdf5)', p: 3, borderRadius: '8px' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Matching Exercise: Parts in Section J
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <PartItem>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af', mr: 1 }}>
                    Part J4:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Building fabric
                  </Typography>
                </PartItem>
              </Grid>
              <Grid item xs={12} sm={4}>
                <PartItem>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af', mr: 1 }}>
                    Part J5:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Building sealing
                  </Typography>
                </PartItem>
              </Grid>
              <Grid item xs={12} sm={4}>
                <PartItem>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af', mr: 1 }}>
                    Part J6:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Air conditioning & ventilation
                  </Typography>
                </PartItem>
              </Grid>
              <Grid item xs={12} sm={4}>
                <PartItem>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669', mr: 1 }}>
                    Part J7:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Artificial lighting & power
                  </Typography>
                </PartItem>
              </Grid>
              <Grid item xs={12} sm={4}>
                <PartItem>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669', mr: 1 }}>
                    Part J8:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Heated water & pools
                  </Typography>
                </PartItem>
              </Grid>
              <Grid item xs={12} sm={4}>
                <PartItem>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669', mr: 1 }}>
                    Part J9:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    Energy monitoring & renewables
                  </Typography>
                </PartItem>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      
      <SlideNumber>9 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide9; 