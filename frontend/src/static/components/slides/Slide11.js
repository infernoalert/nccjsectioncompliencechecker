import React from 'react';
import { Box, Typography, Grid, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
} from '../styles/SlideStyles';
import styled from '@emotion/styled';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BusinessIcon from '@mui/icons-material/Business';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Styled components specific to this slide
const ResourceCard = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const ResourceHeader = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
}));

const ResourceBody = styled(Box)(({ theme }) => ({
  padding: '16px',
  flexGrow: 1,
}));

const ResourceIcon = styled(Box)(({ theme, color }) => ({
  width: '50px',
  height: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  color: 'white',
  marginRight: '16px',
  background: color === 'blue' 
    ? 'linear-gradient(135deg, #2c7da0, #3d8daf)'
    : color === 'green'
    ? 'linear-gradient(135deg, #2a9d8f, #3dbea8)'
    : color === 'teal'
    ? 'linear-gradient(135deg, #2c7da0, #2a9d8f)'
    : 'linear-gradient(135deg, #4361ee, #7209b7)',
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderLeft: '4px solid #3b82f6',
}));

const LinkBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: theme.spacing(2),
  borderLeft: '4px solid #10b981',
  display: 'flex',
  alignItems: 'center',
}));

const Slide11 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Other Useful Resources
          </Typography>
          <GradientDivider />
        </Box>
        
        <InfoBox>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InfoIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1.5, fontSize: '1.5rem' }} />
            <Box>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                These resources are not mandatory. They provide guidance and help, but nothing in them needs to be complied with in order to comply with the NCC.
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151', mt: 1, fontWeight: 500 }}>
                The calculators are guidance tools and not intended to be used as evidence of compliance.
              </Typography>
            </Box>
          </Box>
        </InfoBox>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Facade Calculator */}
          <Grid item xs={12} md={6}>
            <ResourceCard>
              <ResourceHeader>
                <ResourceIcon color="blue">
                  <BusinessIcon />
                </ResourceIcon>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Facade Calculator
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Building envelope assessment tool
                  </Typography>
                </Box>
              </ResourceHeader>
              <ResourceBody>
                <Typography variant="body1" sx={{ color: '#4b5563', mb: 1.5 }}>
                  Assists in understanding J4D6 walls and glazing DTS requirements.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Evaluate different facade designs against requirements"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Explore thermal performance of various materials"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Compare options for glazing and wall construction"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                </List>
              </ResourceBody>
            </ResourceCard>
          </Grid>
          
          {/* Fan System Calculator */}
          <Grid item xs={12} md={6}>
            <ResourceCard>
              <ResourceHeader>
                <ResourceIcon color="green">
                  <AirIcon />
                </ResourceIcon>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Fan System Calculator
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    HVAC system assessment tool
                  </Typography>
                </Box>
              </ResourceHeader>
              <ResourceBody>
                <Typography variant="body1" sx={{ color: '#4b5563', mb: 1.5 }}>
                  Allows a range of inputs for comprehensive fan system evaluation.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Fan system characteristics and fouling risk"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Duct sizes, runs, flow rates, and roughness"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Motor input power calculations and efficiency"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                </List>
              </ResourceBody>
            </ResourceCard>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          {/* Pump System Calculator */}
          <Grid item xs={12} md={6}>
            <ResourceCard>
              <ResourceHeader>
                <ResourceIcon color="teal">
                  <WaterDropIcon />
                </ResourceIcon>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Pump System Calculator
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Hydraulic system assessment tool
                  </Typography>
                </Box>
              </ResourceHeader>
              <ResourceBody>
                <Typography variant="body1" sx={{ color: '#4b5563', mb: 1.5 }}>
                  Evaluates pump system efficiency with comprehensive input options.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Pump system characteristics and speed control"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Operating hours, pump design, pump stage, and speed"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#2563eb', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Pipe details and configuration options"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                </List>
              </ResourceBody>
            </ResourceCard>
          </Grid>
          
          {/* Lighting Calculator */}
          <Grid item xs={12} md={6}>
            <ResourceCard>
              <ResourceHeader>
                <ResourceIcon color="purple">
                  <LightbulbIcon />
                </ResourceIcon>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Lighting Calculator
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Illumination design tool
                  </Typography>
                </Box>
              </ResourceHeader>
              <ResourceBody>
                <Typography variant="body1" sx={{ color: '#4b5563', mb: 1.5 }}>
                  Comprehensive tool for evaluating lighting power density requirements.
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#7c3aed', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Floor areas, perimeter space, and ceiling heights"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#7c3aed', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Design illumination power load calculations"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#7c3aed', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Space type categorization and light color options"
                      primaryTypographyProps={{ variant: 'body2', color: '#374151' }}
                    />
                  </ListItem>
                </List>
              </ResourceBody>
            </ResourceCard>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <LinkBox>
            <OpenInNewIcon sx={{ color: '#059669', mr: 1.5, fontSize: '1.5rem' }} />
            <Typography variant="body1" sx={{ color: '#374151' }}>
              For more information and access to these resources, visit the ABCB website at{' '}
              <Box component="span" sx={{ fontWeight: 500, color: '#2563eb' }}>
                ncc.abcb.gov.au
              </Box>
            </Typography>
          </LinkBox>
        </Box>
      </Box>
      
      <SlideNumber>11 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide11; 