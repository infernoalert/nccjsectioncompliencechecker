import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
  LearnItem,
  InfoBox,
  HistoryItem,
} from '../styles/SlideStyles';

const Slide1 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Energy Efficiency Provisions in NCC Volume One
          </Typography>
          <GradientDivider />
        </Box>

        <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#374151', mb: 4 }}>
          Welcome to this presentation on how to use the energy efficiency provisions in NCC Volume
          One. These provisions form a critical component of Australia's strategy to reduce energy
          consumption and greenhouse gas emissions in buildings.
        </Typography>

        <InfoBox color="blue">
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
            What You Will Learn
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <LearnItem>
                <CheckCircleIcon />
                <Typography>Energy efficiency Performance Requirements in Volume One</Typography>
              </LearnItem>
              <LearnItem>
                <CheckCircleIcon />
                <Typography>Compliance solutions for energy efficiency</Typography>
              </LearnItem>
              <LearnItem>
                <CheckCircleIcon />
                <Typography>Energy efficiency ratings for SOUs</Typography>
              </LearnItem>
            </Grid>
            <Grid item xs={12} md={6}>
              <LearnItem>
                <CheckCircleIcon />
                <Typography>Energy efficiency DTS Provisions</Typography>
              </LearnItem>
              <LearnItem>
                <CheckCircleIcon />
                <Typography>Assessment methods for energy efficiency</Typography>
              </LearnItem>
              <LearnItem>
                <CheckCircleIcon />
                <Typography>Other useful resources</Typography>
              </LearnItem>
            </Grid>
          </Grid>
        </InfoBox>

        <InfoBox color="green">
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
            A Brief History
          </Typography>
          <HistoryItem>
            <HistoryIcon />
            <Typography>
              Energy efficiency provisions have been in Volume One since 2005 for residential
              buildings (multi-residents)
            </Typography>
          </HistoryItem>
          <HistoryItem>
            <HistoryIcon />
            <Typography>
              Provisions for non-residential buildings were introduced in 2006
            </Typography>
          </HistoryItem>
          <HistoryItem>
            <HistoryIcon />
            <Typography>
              Minimum requirements have increased over time with major changes introduced in 2010
              and 2019
            </Typography>
          </HistoryItem>
        </InfoBox>
      </Box>

      <SlideNumber>1 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide1;
