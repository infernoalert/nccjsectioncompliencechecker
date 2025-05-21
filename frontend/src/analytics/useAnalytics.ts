import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from './AnalyticsService';
import { AnalyticsEvent } from './types';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location]);

  const trackEvent = (event: AnalyticsEvent) => {
    analytics.trackEvent(event);
  };

  return { trackEvent };
}; 