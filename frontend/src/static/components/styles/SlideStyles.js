import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

// Slide container
export const SlideContainer = styled(Paper)(({ theme }) => ({
  width: '1440px',
  minHeight: '520px',
  background: 'linear-gradient(to right, #ffffff, #f5f9ff)',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  margin: '0 auto',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
    maxWidth: '1440px',
  },
}));

// Header accent bar
export const HeaderAccent = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '8px',
  background: 'linear-gradient(90deg, #2c7da0 0%, #2a9d8f 100%)',
});

// Slide number indicator
export const SlideNumber = styled('div')({
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  fontSize: '14px',
  color: '#2c7da0',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '4px 10px',
  borderRadius: '12px',
  fontWeight: 500,
});

// Gradient divider
export const GradientDivider = styled('div')({
  width: '96px',
  height: '4px',
  background: 'linear-gradient(to right, #3b82f6, #10b981)',
  borderRadius: '2px',
  marginBottom: '16px',
});

// Learn item with icon
export const LearnItem = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
  marginBottom: '12px',
  '& svg': {
    color: '#2a9d8f',
    marginRight: '10px',
  },
});

// Info box with color variants
export const InfoBox = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: color === 'blue' ? '#eff6ff' : '#f0fdf4',
  borderLeft: `4px solid ${color === 'blue' ? '#3b82f6' : '#10b981'}`,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}));

// History item with icon
export const HistoryItem = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '8px',
  '& svg': {
    color: '#10b981',
    marginTop: '4px',
    marginRight: '12px',
  },
});

// Navigation button
export const NavigationButton = styled('div')({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
