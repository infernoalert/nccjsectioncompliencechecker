import { AnalyticsProvider, AnalyticsEvent, AnalyticsConfig } from './types';
import { GA4Provider } from './providers/GA4Provider';

class AnalyticsService {
  private static instance: AnalyticsService;
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  initialize(config: AnalyticsConfig): void {
    if (this.isInitialized || !config.enabled) return;

    this.providers = config.providers;
    this.providers.forEach(provider => provider.initialize());
    this.isInitialized = true;
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) return;
    this.providers.forEach(provider => provider.trackEvent(event));
  }

  trackPageView(url: string): void {
    if (!this.isInitialized) return;
    this.providers.forEach(provider => provider.trackPageView(url));
  }
}

export const analytics = AnalyticsService.getInstance();

// Create a production-only configuration
export const createAnalyticsConfig = (ga4MeasurementId: string): AnalyticsConfig => ({
  enabled: window.location.hostname !== 'localhost',
  providers: [new GA4Provider(ga4MeasurementId)],
}); 