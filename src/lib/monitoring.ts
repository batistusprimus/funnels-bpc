// Monitoring et Analytics pour BPC Funnels

// Web Vitals tracking
export function reportWebVitals(metric: any) {
  // Log en console pour développement
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric);
  }

  // En production, envoyer à votre service d'analytics
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', {
        name: metric.name,
        data: {
          value: metric.value,
          rating: metric.rating,
        },
      });
    }
  }
}

// Custom event tracking
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event:', eventName, properties);
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, properties);
  }
}

// Error tracking (Sentry placeholder)
export function trackError(error: Error, context?: Record<string, any>) {
  console.error('🔴 Error:', error, context);

  // En production, envoyer à Sentry
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // (window as any).Sentry?.captureException(error, { extra: context });
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string) {
    this.marks.set(label, performance.now());
  }

  end(label: string) {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark for "${label}"`);
      return;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    // Track performance en production
    trackEvent('performance', {
      label,
      duration: Math.round(duration),
    });

    return duration;
  }
}

export const perfMonitor = new PerformanceMonitor();

