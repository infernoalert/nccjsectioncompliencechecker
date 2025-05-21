import { AnalyticsProvider, AnalyticsEvent } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export class GA4Provider implements AnalyticsProvider {
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  initialize(): void {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
  }

  trackEvent(event: AnalyticsEvent): void {
    window.dataLayer.push({
      event: event.name,
      ...event.properties
    });
  }

  trackPageView(url: string): void {
    window.dataLayer.push({
      event: 'page_view',
      page_location: url,
      page_title: document.title
    });
  }
} 