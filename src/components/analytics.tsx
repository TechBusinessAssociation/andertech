import Script from "next/script";
import { site } from "../../content/site";

// Umami Cloud page analytics (cookie-free). Rendered only on the public pages
// (landing, sign-in, request access), never on /members or /admin. It loads on
// the live production site only, so local development and Vercel preview
// deployments never add to the numbers. Set `site.analytics.umamiWebsiteId` to
// null in content/site.ts to turn it off. Clicks are counted with plain
// `data-umami-event` attributes on the links (no JavaScript of our own); the
// landing page's section views come from <SectionReach />.
export function Analytics() {
  const { umamiWebsiteId, umamiScriptUrl } = site.analytics;
  if (!umamiWebsiteId || process.env.VERCEL_ENV !== "production") return null;

  return (
    <Script
      src={umamiScriptUrl}
      data-website-id={umamiWebsiteId}
      // Respect the browser's "Do Not Track" setting.
      data-do-not-track="true"
      strategy="afterInteractive"
    />
  );
}
