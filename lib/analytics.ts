export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>
) {
  // Prevent server-side execution
  if (typeof window === 'undefined') return;

  // Ensure GA is loaded
  type GtagFn = (command: 'event' | string, eventName: string, params?: Record<string, string | number>) => void;

  // The global `gtag` function is injected by Google Analytics.
  const gtag: GtagFn | undefined = (window as unknown as { gtag?: GtagFn }).gtag;
  if (!gtag) return;

  gtag('event', eventName, params);
}