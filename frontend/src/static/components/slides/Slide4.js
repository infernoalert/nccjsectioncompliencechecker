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
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import RouteIcon from '@mui/icons-material/Route';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ErrorIcon from '@mui/icons-material/Error';

// Styled components specific to this slide
const CompliancePath = styled(Box)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  marginBottom: '24px',
}));

const ComplianceHeader = styled(Box)(({ theme, color }) => ({
  color: 'white',
  padding: '12px 15px',
  borderRadius: '8px 8px 0 0',
  fontWeight: 600,
  background: color === 'blue' 
    ? 'linear-gradient(to right, #2563eb, #3b82f6)'
    : 'linear-gradient(to right, #059669, #10b981)',
  display: 'flex',
  alignItems: 'center',
}));

const ComplianceBody = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  padding: '16px',
  borderRadius: '0 0 8px 8px',
}));

const ListItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '8px',
}));

const ArrowConnector = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    height: '40px',
    width: '2px',
    backgroundColor: '#64a8b8',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '10px solid #64a8b8',
  },
}));

const Slide4 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Compliance Pathways
          </Typography>
          <GradientDivider />
        </Box>
        
        <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#374151', mb: 3 }}>
          How can we comply with the energy efficiency Performance Requirements of NCC Volume One?
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 3 }}>
          {/* Left column */}
          <Grid item xs={12} md={6}>
            <CompliancePath>
              <ComplianceHeader color="blue">
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography>Class 3, 5-9 Buildings & Common Areas in Class 2</Typography>
              </ComplianceHeader>
              <ComplianceBody>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Need to meet required energy intensities outlined in J1P1
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    DTS Provisions in Parts J4 to J8 and J9D3 provide compliance solutions
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Apply to all NCC Volume One building classifications
                  </Typography>
                </ListItem>
              </ComplianceBody>
            </CompliancePath>
            
            <CompliancePath>
              <ComplianceHeader color="green">
                <HomeIcon sx={{ mr: 1 }} />
                <Typography>SOUs in Class 2 Buildings & Class 4 Parts</Typography>
              </ComplianceHeader>
              <ComplianceBody>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Must meet star rating and heating/cooling load limits (similar to Class 1)
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Part J3 contains the DTS Provisions needed to satisfy J1P2 and J1P3
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Similar compliance solutions to those in Volume Two
                  </Typography>
                </ListItem>
              </ComplianceBody>
            </CompliancePath>
          </Grid>
          
          {/* Right column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              p: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RouteIcon sx={{ color: '#2563eb', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  Compliance Options
                </Typography>
              </Box>
              
              <Box sx={{ backgroundColor: '#eff6ff', p: 2, borderRadius: '8px', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#1f2937', mb: 1 }}>
                  DTS Solution
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 1 }}>
                  Follow prescriptive requirements in the relevant parts of Section J:
                </Typography>
                <ListItem>
                  <ArrowRightIcon sx={{ color: '#2563eb', mr: 1 }} />
                  <Typography variant="body2">Part J3: SOUs in Class 2 buildings & Class 4 parts</Typography>
                </ListItem>
                <ListItem>
                  <ArrowRightIcon sx={{ color: '#2563eb', mr: 1 }} />
                  <Typography variant="body2">Parts J4-J9: All other building classes</Typography>
                </ListItem>
              </Box>
              
              <ArrowConnector />
              
              <Box sx={{ backgroundColor: '#f0fdf4', p: 2, borderRadius: '8px' }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#1f2937', mb: 1 }}>
                  Performance Solution
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 1 }}>
                  Use alternative methods that achieve the Performance Requirements:
                </Typography>
                <ListItem>
                  <LightbulbIcon sx={{ color: '#059669', mr: 1 }} />
                  <Typography variant="body2">Alternative standards (e.g., Swiss Passiv Haus)</Typography>
                </ListItem>
                <ListItem>
                  <LightbulbIcon sx={{ color: '#059669', mr: 1 }} />
                  <Typography variant="body2">Verification Methods (J1V1-J1V5)</Typography>
                </ListItem>
                <ListItem>
                  <LightbulbIcon sx={{ color: '#059669', mr: 1 }} />
                  <Typography variant="body2">Expert judgment with appropriate evidence</Typography>
                </ListItem>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ backgroundColor: '#dbeafe', p: 3, borderRadius: '8px', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ErrorIcon sx={{ color: '#1d4ed8', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Important Note
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            Regardless of the solution used, appropriate and sufficient evidence must be provided to the approval authority to 
            allow them to assess whether the solution meets the Performance Requirements.
          </Typography>
        </Box>
      </Box>
      
      <SlideNumber>4 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide4; 