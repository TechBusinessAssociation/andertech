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
  contactEmail:
    "tech.business.association@anderson.ucla.edu" as string | null,
  // Subject prefix on feedback emails from the members page ("Broken link or
  // missing something?"), so the board can filter them in the shared inbox.
  feedbackSubject: "AnderTech Website Feedback",
  // The three things the club does, shown on the home page. `icon` must be
  // one of: cap, people, chart, brief, folder (see src/components/icons.tsx).
  pillars: [
    {
      title: "Educational programming",
      blurb: "Workshops and deep-dives on how the tech industry works.",
      icon: "cap",
    },
    {
      title: "Networking opportunities",
      blurb: "Meet founders, alumni and recruiters, on campus and beyond.",
      icon: "people",
    },
    {
      title: "Career development",
      blurb: "Resume, interview and recruiting support for tech roles.",
      icon: "chart",
    },
  ] as { title: string; blurb: string; icon: "cap" | "people" | "chart" | "brief" | "folder" }[],
  // Logo shown in the header. To swap the logo image itself, just replace
  // public/brand/logo.png with a same-named file -- every place that uses
  // <Logo /> (src/components/logo.tsx) picks it up automatically. To use a
  // different file name/path instead, change it here.
  logo: "/brand/logo.png",
  logoAlt: "AnderTech (Tech Business Association at Anderson) logo",
};
