import { AnalyticsProvider, AnalyticsEvent } from '../types';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class GA4Provider implements AnalyticsProvider {
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  initialize(): void {
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId);
  }

  trackEvent(event: AnalyticsEvent): void {
    window.gtag('event', event.name, event.properties);
  }

  trackPageView(url: string): void {
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: document.title,
    });
  }
} 