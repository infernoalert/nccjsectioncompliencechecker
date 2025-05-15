import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { SlideContainer, HeaderAccent, SlideNumber, GradientDivider } from '../styles/SlideStyles';
import styled from '@emotion/styled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import ShieldIcon from '@mui/icons-material/Shield';
import AirIcon from '@mui/icons-material/Air';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ShowerIcon from '@mui/icons-material/Shower';
import SpeedIcon from '@mui/icons-material/Speed';
import DescriptionIcon from '@mui/icons-material/Description';

// Styled components specific to this slide
const ProvisionCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const ProvisionHeader = styled(Box)(({ theme, variant }) => ({
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  fontWeight: 600,
  background:
    variant === 'j4'
      ? 'linear-gradient(90deg, #3d8daf, #5cb5d2)'
      : variant === 'j5'
        ? 'linear-gradient(90deg, #2a9d8f, #3dbea8)'
        : variant === 'j6'
          ? 'linear-gradient(90deg, #2c7da0, #4b9cc2)'
          : variant === 'j7'
            ? 'linear-gradient(90deg, #2a9d8f, #3dbea8)'
            : variant === 'j8'
              ? 'linear-gradient(90deg, #2c7da0, #4b9cc2)'
              : 'linear-gradient(90deg, #2a9d8f, #3dbea8)',
}));

const ProvisionIcon = styled(Box)(({ theme }) => ({
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

const ListItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '8px',
}));

const Slide5 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            DTS Provisions in Section J
          </Typography>
          <GradientDivider />
        </Box>

        <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#374151', mb: 3 }}>
          The Deemed-to-Satisfy (DTS) Provisions offer prescriptive approaches to satisfying the
          Performance Requirements. Each part addresses different aspects of building energy
          efficiency:
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* J4 Building Fabric */}
          <Grid item xs={12} md={4}>
            <ProvisionCard>
              <ProvisionHeader variant="j4">
                <ProvisionIcon>
                  <BusinessIcon />
                </ProvisionIcon>
                <Typography>Part J4: Building Fabric</Typography>
              </ProvisionHeader>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Focuses on constructing buildings that reduce the need for mechanical heating and
                  cooling.
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Enhances occupant comfort through thermal performance
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Specifies R-values for walls, roofs, and floors
                  </Typography>
                </ListItem>
              </Box>
            </ProvisionCard>
          </Grid>

          {/* J5 Building Sealing */}
          <Grid item xs={12} md={4}>
            <ProvisionCard>
              <ProvisionHeader variant="j5">
                <ProvisionIcon>
                  <ShieldIcon />
                </ProvisionIcon>
                <Typography>Part J5: Building Sealing</Typography>
              </ProvisionHeader>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Controls unwanted air leakage through the building envelope.
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Reduces energy for heating, cooling, and humidity control
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Works with other elements as a system for energy efficiency
                  </Typography>
                </ListItem>
              </Box>
            </ProvisionCard>
          </Grid>

          {/* J6 Air-conditioning and Ventilation */}
          <Grid item xs={12} md={4}>
            <ProvisionCard>
              <ProvisionHeader variant="j6">
                <ProvisionIcon>
                  <AirIcon />
                </ProvisionIcon>
                <Typography>Part J6: HVAC Systems</Typography>
              </ProvisionHeader>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Addresses HVAC systems which constitute about 43% of building energy use.
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Promotes efficient design of air conditioning and ventilation
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Removes poor practice from new installations
                  </Typography>
                </ListItem>
              </Box>
            </ProvisionCard>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* J7 Artificial Lighting and Power */}
          <Grid item xs={12} md={4}>
            <ProvisionCard>
              <ProvisionHeader variant="j7">
                <ProvisionIcon>
                  <LightbulbIcon />
                </ProvisionIcon>
                <Typography>Part J7: Lighting & Power</Typography>
              </ProvisionHeader>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Addresses lighting which typically accounts for 26% of office building electrical
                  energy.
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Promotes energy-efficient LED lighting solutions
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Includes adjustment factors (e.g., motion sensors)
                  </Typography>
                </ListItem>
              </Box>
            </ProvisionCard>
          </Grid>

          {/* J8 Heated Water Supply */}
          <Grid item xs={12} md={4}>
            <ProvisionCard>
              <ProvisionHeader variant="j8">
                <ProvisionIcon>
                  <ShowerIcon />
                </ProvisionIcon>
                <Typography>Part J8: Hot Water & Pools</Typography>
              </ProvisionHeader>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Covers heated water supply for food preparation and sanitary purposes.
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Requirements for hot water systems energy efficiency
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">Swimming and spa pool plant requirements</Typography>
                </ListItem>
              </Box>
            </ProvisionCard>
          </Grid>

          {/* J9 Energy Monitor */}
          <Grid item xs={12} md={4}>
            <ProvisionCard>
              <ProvisionHeader variant="j9">
                <ProvisionIcon>
                  <SpeedIcon />
                </ProvisionIcon>
                <Typography>Part J9: Energy Monitor</Typography>
              </ProvisionHeader>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  Covers energy Monitor and future-proofing for renewable energy systems.
                </Typography>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Facilitates easy future retrofit of renewable energy equipment
                  </Typography>
                </ListItem>
                <ListItem>
                  <CheckCircleIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <Typography variant="body2">
                    Provisions for electric vehicle charging infrastructure
                  </Typography>
                </ListItem>
              </Box>
            </ProvisionCard>
          </Grid>
        </Grid>

        <Box sx={{ backgroundColor: '#eff6ff', p: 3, borderRadius: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ color: '#2563eb', mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Supporting Specifications
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
            Section J includes 10 specifications that provide detailed requirements:
            <Box component="span" sx={{ fontWeight: 500 }}>
              {' '}
              6 specifications support the Deemed-to-Satisfy Provisions
            </Box>
            , while the others relate to Performance Requirements and Verification Methods.
          </Typography>

          <Typography variant="body2" sx={{ color: '#2563eb', fontStyle: 'italic', mt: 1 }}>
            Note: All elements within Section J are designed to work as a system to ensure the
            building achieves the desired level of energy efficiency.
          </Typography>
        </Box>
      </Box>

      <SlideNumber>5 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide5;
