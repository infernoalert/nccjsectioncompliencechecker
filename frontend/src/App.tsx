import { useEffect } from 'react';
import { analytics, createAnalyticsConfig } from './analytics/AnalyticsService';

// Replace this with your actual GA4 measurement ID
const GA4_MEASUREMENT_ID = 'G-BEP4WTXN96';

function App() {
  useEffect(() => {
    // Initialize analytics only in production
    analytics.initialize(createAnalyticsConfig(GA4_MEASUREMENT_ID));
  }, []);

  return (
    // Your app content
  );
}

export default App; 