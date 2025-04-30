import React from 'react';
import { Box, Typography, Grid, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import {
  SlideContainer,
  HeaderAccent,
  SlideNumber,
  GradientDivider,
} from '../styles/SlideStyles';
import styled from '@emotion/styled';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

// Styled components specific to this slide
const TrueFalseCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const QuestionBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const AnswerBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
}));

const BuildingCard = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
  },
}));

const BuildingHeader = styled(Box)(({ theme, compliant }) => ({
  padding: '12px 16px',
  fontWeight: 600,
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: compliant 
    ? 'linear-gradient(90deg, #2a9d8f, #3dbea8)'
    : 'linear-gradient(90deg, #e76f51, #f4a261)',
}));

const UnitRow = styled(Box)(({ theme, problem }) => ({
  padding: '10px 16px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: problem ? 'rgba(231, 111, 81, 0.1)' : 'transparent',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const StarRating = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    color: '#f59e0b',
    marginRight: '2px',
  },
}));

const SummaryBox = styled(Box)(({ theme, compliant }) => ({
  backgroundColor: compliant ? '#d1fae5' : '#fee2e2',
  padding: theme.spacing(2),
}));

const ClassificationBadge = styled('span')(({ theme }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '15px',
  fontSize: '12px',
  fontWeight: 600,
  backgroundColor: 'rgba(44, 125, 160, 0.15)',
  color: '#2c7da0',
  marginRight: '5px',
  marginBottom: '5px',
}));

const MethodBox = styled(Box)(({ theme, color }) => ({
  backgroundColor: color === 'blue' ? '#eff6ff' : '#f0fdf4',
  padding: theme.spacing(2),
  borderRadius: '8px',
}));

const Slide10 = () => {
  return (
    <SlideContainer>
      <HeaderAccent />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            Practical Application Examples
          </Typography>
          <GradientDivider />
        </Box>
        
        {/* True/False Question */}
        <TrueFalseCard>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2, display: 'flex', alignItems: 'center' }}>
            <QuestionMarkIcon sx={{ color: '#2563eb', mr: 1 }} />
            True or False?
          </Typography>
          
          <QuestionBox>
            <Typography variant="body1" sx={{ color: '#374151' }}>
              For an SOU in a Class 2 building, a minimum 6-star energy efficiency rating is sufficient to demonstrate compliance with J1P1.
            </Typography>
          </QuestionBox>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AnswerBox>
              <CancelIcon sx={{ color: '#dc2626', mr: 1, fontSize: '1.5rem' }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                False
              </Typography>
            </AnswerBox>
            <Box sx={{ mx: 2, color: '#9ca3af' }}>|</Box>
            <Typography variant="body1" sx={{ color: '#4b5563' }}>
              A minimum 6-star rating demonstrates compliance with just some requirements. You also need to demonstrate compliance with other DTS Provisions for thermal breaks, building sealing, etc.
            </Typography>
          </Box>
        </TrueFalseCard>
        
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2, display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ color: '#2563eb', mr: 1 }} />
          Which Class 2 Building Meets Energy Efficiency Requirements?
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Building A */}
          <Grid item xs={12} md={4}>
            <BuildingCard>
              <BuildingHeader compliant>
                <Typography variant="subtitle1">Building A</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Compliant</Typography>
                </Box>
              </BuildingHeader>
              <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#047857', fontWeight: 500 }}>
                  Average: 7.0★
                </Typography>
              </Box>
              <UnitRow>
                <Typography variant="body2">Unit 1</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>6.5</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 2</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>7.0</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 3</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>6.5</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 4</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>8.0</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <SummaryBox compliant>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="All units ≥ 6★"
                      primaryTypographyProps={{ variant: 'body2', color: '#065f46' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Average = 7★"
                      primaryTypographyProps={{ variant: 'body2', color: '#065f46' }}
                    />
                  </ListItem>
                </List>
              </SummaryBox>
            </BuildingCard>
          </Grid>
          
          {/* Building B */}
          <Grid item xs={12} md={4}>
            <BuildingCard>
              <BuildingHeader compliant={false}>
                <Typography variant="subtitle1">Building B</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CancelIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Non-compliant</Typography>
                </Box>
              </BuildingHeader>
              <Box sx={{ p: 1.5, bgcolor: '#fef2f2', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 500 }}>
                  Average: 6.75★
                </Typography>
              </Box>
              <UnitRow>
                <Typography variant="body2">Unit 1</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>6.5</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 2</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>7.0</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 3</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>6.0</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 4</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>7.5</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <SummaryBox compliant={false}>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="All units ≥ 6★"
                      primaryTypographyProps={{ variant: 'body2', color: '#991b1b' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelIcon sx={{ color: '#dc2626', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Average < 7★"
                      primaryTypographyProps={{ variant: 'body2', color: '#991b1b' }}
                    />
                  </ListItem>
                </List>
              </SummaryBox>
            </BuildingCard>
          </Grid>
          
          {/* Building C */}
          <Grid item xs={12} md={4}>
            <BuildingCard>
              <BuildingHeader compliant={false}>
                <Typography variant="subtitle1">Building C</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CancelIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Non-compliant</Typography>
                </Box>
              </BuildingHeader>
              <Box sx={{ p: 1.5, bgcolor: '#fef2f2', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 500 }}>
                  Average: 7.0★
                </Typography>
              </Box>
              <UnitRow>
                <Typography variant="body2">Unit 1</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>7.0</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 2</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>8.0</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow problem>
                <Typography variant="body2">Unit 3</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>5.5</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <UnitRow>
                <Typography variant="body2">Unit 4</Typography>
                <StarRating>
                  <Typography variant="body2" sx={{ mr: 0.5 }}>7.5</Typography>
                  <StarIcon />
                </StarRating>
              </UnitRow>
              <SummaryBox compliant={false}>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelIcon sx={{ color: '#dc2626', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Unit 3 < 6★ minimum"
                      primaryTypographyProps={{ variant: 'body2', color: '#991b1b' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Average = 7★"
                      primaryTypographyProps={{ variant: 'body2', color: '#991b1b' }}
                    />
                  </ListItem>
                </List>
              </SummaryBox>
            </BuildingCard>
          </Grid>
        </Grid>
        
        {/* Verification Methods Quick Reference */}
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
          Which Building Classifications Can Each Verification Method Be Used With?
        </Typography>
        
        <Paper sx={{ p: 3, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <MethodBox color="blue">
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1e40af', mb: 1 }}>
                  J1V1 NABERS Energy
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <ClassificationBadge>Class 3</ClassificationBadge>
                  <ClassificationBadge>Class 5</ClassificationBadge>
                  <ClassificationBadge>Class 6</ClassificationBadge>
                  <ClassificationBadge>Class 2 common areas</ClassificationBadge>
                </Box>
              </MethodBox>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <MethodBox color="green">
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#065f46', mb: 1 }}>
                  J1V2 Green Star
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <ClassificationBadge>Class 3</ClassificationBadge>
                  <ClassificationBadge>Class 5</ClassificationBadge>
                  <ClassificationBadge>Class 6</ClassificationBadge>
                  <ClassificationBadge>Class 7</ClassificationBadge>
                  <ClassificationBadge>Class 8</ClassificationBadge>
                  <ClassificationBadge>Class 9</ClassificationBadge>
                  <ClassificationBadge>Class 2 common areas</ClassificationBadge>
                </Box>
              </MethodBox>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <MethodBox color="blue">
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1e40af', mb: 1 }}>
                  J1V3 Reference Building
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <ClassificationBadge>Class 3</ClassificationBadge>
                  <ClassificationBadge>Class 5</ClassificationBadge>
                  <ClassificationBadge>Class 6</ClassificationBadge>
                  <ClassificationBadge>Class 7</ClassificationBadge>
                  <ClassificationBadge>Class 8</ClassificationBadge>
                  <ClassificationBadge>Class 9</ClassificationBadge>
                  <ClassificationBadge>Class 2 common areas</ClassificationBadge>
                </Box>
              </MethodBox>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <MethodBox color="green">
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#065f46', mb: 1 }}>
                  J1V4 Building Envelope Sealing
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <ClassificationBadge>Class 2</ClassificationBadge>
                  <ClassificationBadge>Class 3</ClassificationBadge>
                  <ClassificationBadge>Class 4</ClassificationBadge>
                  <ClassificationBadge>Class 5</ClassificationBadge>
                  <ClassificationBadge>Class 6</ClassificationBadge>
                  <ClassificationBadge>Class 8</ClassificationBadge>
                  <ClassificationBadge>Class 9</ClassificationBadge>
                </Box>
              </MethodBox>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <MethodBox color="blue">
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1e40af', mb: 1 }}>
                  J1V5 Reference Building for SOUs
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <ClassificationBadge>Class 2 SOUs only</ClassificationBadge>
                </Box>
              </MethodBox>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <SlideNumber>10 / 12</SlideNumber>
    </SlideContainer>
  );
};

export default Slide10; 