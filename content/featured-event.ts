// The "Coming up" card near the top of the home page: one featured event.
// Edit this file to change it, or set `featuredEvent` to null to hide it.
// Everything here is public.
//
// The card stays until you change this file: after the event, replace the
// values with the next event, or set `featuredEvent` to null to remove it.
// (It deliberately doesn't hide itself by date: that would need the home page
// to re-render on a schedule instead of being plain static files on the CDN.)

export type FeaturedEvent = {
  // Small label above the title.
  label: string;
  title: string;
  // The theme / tagline shown under the title.
  theme: string;
  // Who presents it.
  presentedBy: string;
  // YYYY-MM-DD. Used for the machine-readable date on the card.
  date: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  agenda: { time: string; title: string; details?: string[] }[];
  // Optional button (RSVP / registration). null hides the button.
  link: { label: string; href: string } | null;
};

export const featuredEvent: FeaturedEvent | null = {
  label: "Coming up",
  title: "Tech + Society Conference",
  theme:
    "Technology & Human Agency in the AI Era: How Leaders, Workers, & Institutions Prosper",
  presentedBy: "The Easton Technology Management Center and AnderTech",
  date: "2026-10-16",
  dateLabel: "Friday, October 16, 2026",
  timeLabel: "8:45 am – 3:00 pm",
  venue: "UCLA Anderson · Korn Convocation Hall",
  agenda: [
    { time: "8:45 – 9:30 am", title: "Check-in and breakfast" },
    { time: "9:30 am – 12:30 pm", title: "Conference programming" },
    { time: "12:30 – 1:30 pm", title: "Networking lunch" },
    {
      time: "1:30 – 3:00 pm",
      title: "AI workshops",
      details: [
        "AI Essentials: From Curious to Capable",
        "AI Builder: From Capable to Creator",
      ],
    },
  ],
  // TODO: add the RSVP / registration link when there is one, e.g.
  // { label: "Register", href: "https://..." }
  link: null,
};
