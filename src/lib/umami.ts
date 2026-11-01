// Browser-side helper for sending a named event to Umami (see
// src/components/analytics.tsx). Returns false when the analytics script isn't
// loaded (ad blocker, local dev, preview deployments, or still loading), so
// callers can retry or just carry on. Client components only.
type UmamiWindow = Window & {
  umami?: { track: (name: string, data?: Record<string, string>) => void };
};

export function trackEvent(name: string, data?: Record<string, string>): boolean {
  const umami = (window as UmamiWindow).umami;
  if (!umami) return false;
  umami.track(name, data);
  return true;
}
