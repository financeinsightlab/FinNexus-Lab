export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>
) {
  // Prevent server-side execution
  if (typeof window === 'undefined') return;

  // Ensure GA is loaded
  if (!(window as any).gtag) return;

  (window as any).gtag('event', eventName, params);
}