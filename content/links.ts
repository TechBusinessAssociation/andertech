// External links. Set a value to a full https:// URL to turn a link on.
// A value of null means "not ready yet" and the site hides or disables it.
// Only PUBLIC links belong here. Never add the Looker Studio dashboard,
// SharePoint links, or anything that should be private.

export const links = {
  // Google Form: welcome survey, open to anyone with the link.
  joinSurvey:
    "https://docs.google.com/forms/d/e/1FAIpQLSf5tvekWCDfFcCoD5989n-Tgd4d4MAXD9mEjbU7sSMA6MmXeA/viewform" as string | null,
  // Public Google Calendar embed URL (Phase 1 calendar section). Get this
  // from Google Calendar > Settings > [calendar] > "Integrate calendar" >
  // "Embed code" -- copy the src="..." value, not the whole <iframe> tag.
  calendarEmbed: null as string | null,
  linkedin: null as string | null,
  // Sourced from AnderTech's Anderson club page.
  instagram: "https://www.instagram.com/andertechba/" as string | null,
  facebook: "https://www.facebook.com/AnderTechBA/" as string | null,
};
