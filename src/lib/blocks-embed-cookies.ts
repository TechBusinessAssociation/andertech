// Does this browser block the Google sign-in cookie inside a cross-site
// iframe? Safari and every iOS browser (all are WebKit underneath, including
// Chrome/Firefox/Edge on iPhone) do, so a private Looker Studio embed shows
// "Can't access report" there -- and Looker Studio (unlike paid Looker) has
// no way around it. Those visitors get an "open dashboard" button instead.
//
// A user-agent check is a best guess, not a guarantee: if it misses, the
// visitor just sees Looker's own error inside the iframe, same as before.
export function blocksEmbedCookies(userAgent: string | null): boolean {
  if (!userAgent) return false;
  // iPhone/iPad/iPod, plus the iOS-only tokens Chrome, Firefox and Edge use
  // (an iPad asking for the desktop site can otherwise look like a Mac).
  if (/iPhone|iPad|iPod|CriOS|FxiOS|EdgiOS/.test(userAgent)) return true;
  // Desktop Safari (and iPadOS desktop mode): "Safari/" without any of the
  // Chromium-family tokens that also include it.
  return (
    /Safari\//.test(userAgent) &&
    !/Chrome|Chromium|Edg|OPR|Firefox|Android/.test(userAgent)
  );
}
