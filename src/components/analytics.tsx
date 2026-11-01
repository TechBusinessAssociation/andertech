import Script from "next/script";
import { site } from "../../content/site";

// Umami Cloud page analytics (cookie-free). Rendered on the public pages
// (landing, sign-in, request access) and, through src/app/members/layout.tsx,
// on /members -- never on /admin. It loads on the live production site only,
// so local development and Vercel preview deployments never add to the
// numbers. Set `site.analytics.umamiWebsiteId` to null in content/site.ts to
// turn it off. Clicks are counted with plain `data-umami-event` attributes on
// the links; views of a page or tab use <TrackEvent />; the landing page's
// section views come from <SectionReach />.
//
// Privacy: no one is identified (no names or emails are ever sent). The
// members directory search puts what a person typed into the URL (?dq=...), so
// `umamiBeforeSend` below strips the query string from any /members address
// (and from a /members referrer) before it leaves the browser. Which members
// tab was opened is therefore recorded as an event, not read from the URL.
const beforeSend = `window.umamiBeforeSend=function(type,payload){try{
var strip=function(u){try{var x=new URL(u,location.origin);return x.pathname.indexOf("/members")===0?x.origin+x.pathname:u}catch(e){return u}};
if(payload){if(typeof payload.url==="string"&&payload.url.indexOf("/members")===0){payload.url=payload.url.split("?")[0].split("#")[0]}
if(typeof payload.referrer==="string"&&payload.referrer){payload.referrer=strip(payload.referrer)}}}catch(e){}return payload};`;

export function Analytics() {
  const { umamiWebsiteId, umamiScriptUrl } = site.analytics;
  if (!umamiWebsiteId || process.env.VERCEL_ENV !== "production") return null;

  return (
    <>
      <Script id="umami-before-send" strategy="afterInteractive">
        {beforeSend}
      </Script>
      <Script
        src={umamiScriptUrl}
        data-website-id={umamiWebsiteId}
        data-before-send="umamiBeforeSend"
        // Respect the browser's "Do Not Track" setting.
        data-do-not-track="true"
        strategy="afterInteractive"
      />
    </>
  );
}
