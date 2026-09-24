// Club-wide text. Edit this file to change the name, tagline or contact info.
// Everything here is public. No personal emails or private links.

export const site = {
  // Short name used in the page header and browser tab.
  name: "AnderTech",
  officialName: "Tech Business Association at Anderson",
  // Official description, from AnderTech's Anderson club page.
  tagline:
    "The gateway to the tech industry for MBA candidates at UCLA Anderson.",
  description:
    "AnderTech helps members launch or advance careers in tech and tech-driven industries through educational programming, networking, and career development.",
  // Use a club/shared inbox, never a personal address. null hides it.
  // Anderson's club page only lists individual officer @anderson.ucla.edu
  // addresses -- those are personal, not a club inbox, so don't use them
  // here. Fill this in once the club has a shared inbox.
  contactEmail: null as string | null,
  // Logo shown in the header. To swap the logo image itself, just replace
  // public/brand/logo.png with a same-named file -- every place that uses
  // <Logo /> (src/components/logo.tsx) picks it up automatically. To use a
  // different file name/path instead, change it here.
  logo: "/brand/logo.png",
  logoAlt: "AnderTech (Tech Business Association at Anderson) logo",
};
