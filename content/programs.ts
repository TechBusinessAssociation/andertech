// The "What we do" chapters on the home page. Edit this file to change the
// copy, add or remove programs, or add photos -- no component changes needed.
// Everything here is public.
//
// The three chapters use the same names as the three pillars in
// content/site.ts, so the hero and this section stay consistent.
//
// Source: the club's 2026 Operating Calendar (2026-27 program), checked
// against Anderson's public pages for the conferences. The calendar is
// internal, so this copy is deliberately generic: no dates, company names,
// budgets, venues or people, and nothing cancelled or on hold. Programs
// change with each board: delete anything that stops running, and add
// new ones here.
//
// PHOTOS: a chapter's `photo` is null until you add one. To add it, put the
// image in public/photos/ (about 1600px wide, JPEG or WebP, under ~400 KB)
// and set { src: "/photos/learn.jpg", alt: "what the photo shows" }. Only use
// photos of people who agreed to appear on a public website (Rule 7). While
// `photo` is null the chapter shows a numbered panel instead.

export type Program = { title: string; blurb: string };

export type Chapter = {
  // Anchor for links, e.g. /#educational-programming
  id: string;
  // Small heading above the statement; matches a pillar in content/site.ts.
  label: string;
  // The big statement.
  heading: string;
  // A short paragraph shown under the photo.
  body: string;
  programs: Program[];
  photo: { src: string; alt: string } | null;
};

export const programsIntro = {
  label: "What we do",
  heading: "From curious about tech to your first offer.",
};

export const chapters: Chapter[] = [
  {
    id: "educational-programming",
    label: "Educational programming",
    heading: "Start from zero. Leave with real skills.",
    body: "Tech is a big industry with a lot of doors. Our sessions give you the vocabulary, the frameworks and the hands-on practice to walk through them, whatever you did before Anderson.",
    programs: [
      {
        title: "Accelerated Curriculum",
        blurb: "Five tech deep-dives on how the internet, storage, cloud compute, data systems and software delivery really work, each paired with a strategy case.",
      },
      {
        title: "Hands-on skills workshops",
        blurb: "Write a product spec, prototype an MVP with AI tools, learn SQL, ship a website and practice system design.",
      },
      {
        title: "Function 101 sessions",
        blurb: "Walk through how a function really works, from idea to design to engineering to QA.",
      },
      {
        title: "Speaker panels",
        blurb: "Practitioners on tech and entertainment, sports, policy, global markets and more.",
      },
      {
        title: "Founder AMAs & product demos",
        blurb: "Fireside chats with experienced executives, and tech companies pitching their latest products on campus.",
      },
      {
        title: "Flagship conference",
        blurb: "The annual Emerging Tech Conference, co-hosted with the Entrepreneur Association: panels, workshops, demos and more.",
      },
    ],
    photo: null,
  },
  {
    id: "networking-opportunities",
    label: "Networking opportunities",
    heading: "Meet the people who hire, and the people who've been there.",
    body: "Recruiting runs on relationships. We put you in the room with recruiters, founders, alumni and each other, early enough for it to matter.",
    programs: [
      {
        title: "Career Nights",
        blurb: "Networking with alumni working in tech, plus Startup Career Nights with founders.",
      },
      {
        title: "Days-on-the-Job & company visits",
        blurb: "Go to companies, or have them come to campus, to see the work and meet the teams.",
      },
      {
        title: "Treks & site visits",
        blurb: "Curated group trips to LA Tech Week and other local tech conferences, plus regular visits to see emerging tech deployed at scale.",
      },
      {
        title: "Mixers",
        blurb: "First-year and second-year socials, cross-school mixers with Marshall and Haas, and a quarterly mixer pairing MBAs with engineering, law, medical and film students.",
      },
      {
        title: "Mentorship program",
        blurb: "Join the program at the start of the year, with check-ins along the way.",
      },
      {
        title: "Cross-club events",
        blurb: "Joint events with other Anderson groups, including the Entrepreneur Association, women in tech and the identity clubs.",
      },
    ],
    photo: null,
  },
  {
    id: "career-development",
    label: "Career development",
    heading: "Practice until the real thing feels routine.",
    body: "Interviews are a skill. We run the workshops, mock interviews and case practice that turn interest into offers, and members get a library of recruiting resources on top.",
    programs: [
      {
        title: "Resume, cover letter & networking workshops",
        blurb: "Write a tech-ready resume and cover letter, and learn the professionalism recruiters expect.",
      },
      {
        title: "Interview prep",
        blurb: "Coaching from second-years, speed behavioral mocks, alumni mock interviews and strategy casing practice.",
      },
      {
        title: "Recruiting strategy sessions",
        blurb: "Panels on full-time re-recruiting, a workshop for international students, and company panels with the employers that hire most.",
      },
      {
        title: "Ship It build sessions",
        blurb: "Monthly virtual sessions where members write and publish a LinkedIn post about what they built that month.",
      },
      {
        title: "Members-only resource library",
        blurb: "Recruiting guides, trackers and upcoming events, available after you sign in.",
      },
    ],
    photo: null,
  },
];
