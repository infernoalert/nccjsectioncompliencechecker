import React from 'react';
import { Box, Typography, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { SlideContainer, HeaderAccent, SlideNumber, GradientDivider } from '../styles/SlideStyles';
import styled from '@emotion/styled';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

// Styled components specific to this slide
const QACard = styled(Box)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: 'white',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const Question = styled(Box)(({ theme, color }) => ({
  padding: '16px 20px',
  background: `linear-gradient(90deg, ${color === 'blue' ? 'rgba(44, 125, 160, 0.1)' : 'rgba(42, 157, 143, 0.1)'}, ${color === 'blue' ? 'rgba(42, 157, 143, 0.1)' : 'rgba(44, 125, 160, 0.1)'})`,
  borderRadius: '8px 8px 0 0',
  borderLeft: `4px solid ${color === 'blue' ? '#2c7da0' : '#2a9d8f'}`,
}));

const Answer = styled(Box)(({ theme }) => ({
  padding: '16px 20px',
  borderRadius: '0 0 8px 8px',
}));

const Highlight = styled('span')(({ theme }) => ({
  backgroundColor: 'rgba(42, 157, 143, 0.1)',
  padding: '2px 5px',
  borderRadius: '4px',
  fontWeight: 500,
}));

const ClimateZone = styled('span')(({ theme }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '50px',
  backgroundColor: 'rgba(44, 125, 160, 0.1)',
  color: '#2c7da0',
  fontWeight: 500,
  marginRight: '3px',
  marginBottom: '3px',
  border: '1px solid rgba(44, 125, 160, 0.2)',
}));

const ControlOption = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '4px',
  padding: '8px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'flex-start',
}));

const Slide8 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Interpreting the DTS Provisions in Section J
          </Typography>
          <GradientDivider />
        </Box>

        <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
          Let's review some practical examples to better understand how to apply the DTS Provisions
          in Section J:
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Question 1 */}
          <Grid item xs={12} md={6}>
            <QACard>
              <Question color="blue">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <QuestionMarkIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <span>Question 1: Ceiling fans in sole occupancy units</span>
                </Typography>
              </Question>
              <Answer>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  According to Part J3, what DTS Provisions apply to ceiling fans in a sole
                  occupancy unit of a Class 2 building or a Class 4 part of a building?
                </Typography>
                <Box sx={{ backgroundColor: '#eff6ff', p: 2, borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#1e40af' }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      J3D4:
                    </Box>{' '}
                    Ceiling fans must be installed in accordance with Table J3D4 in specified
                    climate zones and states. They must be permanently installed and have a speed
                    controller.
                  </Typography>
                </Box>
              </Answer>
            </QACard>
          </Grid>

          {/* Question 2 */}
          <Grid item xs={12} md={6}>
            <QACard>
              <Question color="green">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <QuestionMarkIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <span>Question 2: Roof and ceiling R-Values</span>
                </Typography>
              </Question>
              <Answer>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  According to Part J4, what is the minimum Total R-Value required for a roof or
                  ceiling in the following climate zones?
                </Typography>
                <Box sx={{ backgroundColor: '#ecfdf5', p: 2, borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#065f46', mb: 1 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      J4D4 roof and ceiling construction:
                    </Box>
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ClimateZone>Zone 3</ClimateZone>
                      <Highlight sx={{ ml: 1 }}>R3.7</Highlight>
                      <Typography variant="body2" sx={{ color: '#4b5563', ml: 1 }}>
                        (downward heat flow)
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ClimateZone>Zone 6</ClimateZone>
                      <Highlight sx={{ ml: 1 }}>R3.2</Highlight>
                      <Typography variant="body2" sx={{ color: '#4b5563', ml: 1 }}>
                        (downward heat flow)
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ClimateZone>Zone 8</ClimateZone>
                      <Highlight sx={{ ml: 1 }}>R4.8</Highlight>
                      <Typography variant="body2" sx={{ color: '#4b5563', ml: 1 }}>
                        (upward heat flow)
                      </Typography>
                    </ListItem>
                  </List>
                </Box>
              </Answer>
            </QACard>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Question 3 */}
          <Grid item xs={12} md={6}>
            <QACard>
              <Question color="blue">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <QuestionMarkIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                  <span>Question 3: Exhaust fan sealing devices</span>
                </Typography>
              </Question>
              <Answer>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  According to Part J5, when must an exhaust fan have a sealing device like a
                  self-closing damper?
                </Typography>
                <Box sx={{ backgroundColor: '#eff6ff', p: 2, borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#1e40af' }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      J5D6 Exhaust fans:
                    </Box>{' '}
                    A sealing device is required when the exhaust fan services a conditioned space
                    or habitable room in climate zones 4, 5, 6, 7 or 8.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                    <ClimateZone>Zone 4</ClimateZone>
                    <ClimateZone>Zone 5</ClimateZone>
                    <ClimateZone>Zone 6</ClimateZone>
                    <ClimateZone>Zone 7</ClimateZone>
                    <ClimateZone>Zone 8</ClimateZone>
                  </Box>
                </Box>
              </Answer>
            </QACard>
          </Grid>

          {/* Question 4 */}
          <Grid item xs={12} md={6}>
            <QACard>
              <Question color="green">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <QuestionMarkIcon sx={{ color: '#059669', mt: 0.5, mr: 1 }} />
                  <span>Question 4: Time switch exceptions</span>
                </Typography>
              </Question>
              <Answer>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                  According to Part J6, a mechanical ventilation system must have a time switch if
                  the airflow rate is more than 1000 litres per second. When does this requirement
                  not apply?
                </Typography>
                <Box sx={{ backgroundColor: '#ecfdf5', p: 2, borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#065f46', mb: 1 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      J6D4(4) Time switches:
                    </Box>{' '}
                    A time switch is not required for a mechanical ventilation system that:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Serves only one SOU in a Class 2, 3 or 9c building or a Class 4 part of a building"
                        primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Serves a building where mechanical ventilation is needed for 24-hour occupancy"
                        primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Answer>
            </QACard>
          </Grid>
        </Grid>

        {/* Question 5 */}
        <QACard sx={{ mt: 3 }}>
          <Question
            sx={{
              background:
                'linear-gradient(90deg, rgba(44, 125, 160, 0.15), rgba(42, 157, 143, 0.15))',
              borderLeft: '4px solid #3a86a3',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'flex-start' }}
            >
              <QuestionMarkIcon sx={{ color: '#1e40af', mt: 0.5, mr: 1 }} />
              <span>Question 5: Exterior artificial lighting controls</span>
            </Typography>
          </Question>
          <Answer>
            <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
              According to Part J7, what controls can be used for exterior artificial lighting
              attached to or directed at the façade of a building?
            </Typography>
            <Box
              sx={{
                background:
                  'linear-gradient(135deg, rgba(44, 125, 160, 0.1), rgba(42, 157, 143, 0.1))',
                p: 2,
                borderRadius: '8px',
              }}
            >
              <Typography variant="body2" sx={{ color: '#1e40af', mb: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  J7D6 Exterior artificial lighting:
                </Box>{' '}
                Exterior artificial lighting attached to or directed at the façade of a building
                must be controlled by:
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <ControlOption>
                    <WbSunnyIcon sx={{ color: '#f97316', mt: 0.5, mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#4b5563' }}>
                      A daylight sensor
                    </Typography>
                  </ControlOption>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ControlOption>
                    <AccessTimeIcon sx={{ color: '#2563eb', mt: 0.5, mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#4b5563' }}>
                      A time switch with variable programming capabilities
                    </Typography>
                  </ControlOption>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ color: '#4b5563', mt: 2 }}>
                Additionally, if the total lighting load exceeds 100 watts:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <LightbulbIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Use LEDs for 90% of the lighting load, or"
                    primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <DirectionsWalkIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Motion sensor in line with Specification 40, or"
                    primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <AccessTimeIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="A separate time switch in line with Specification 40 when the lighting is used for decorative purposes"
                    primaryTypographyProps={{ variant: 'body2', color: '#4b5563' }}
                  />
                </ListItem>
              </List>
            </Box>
          </Answer>
        </QACard>
      </Box>

      <SlideNumber>8 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide8;
