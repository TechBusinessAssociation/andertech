// The "What we do" chapters on the home page. Edit this file to change the
// copy, add or remove programs, or add photos -- no component changes needed.
// Everything here is public.
//
// The three chapters use the same names as the three pillars in
// content/site.ts, so the hero and this section stay consistent.
//
// Sources: the club's Anderson page (Kick-Off Night/101 Series, Tech Bytes,
// Technology Career Night, Tech Treks, Days-on-the-Job, alumni mentorship,
// cross-club collaborations, interview prep and case workshops, APIC) and the
// 2023-24 event planner (function deep-dives, Crypto & Web3 101, career
// mixers, the Emerging Technology Summit, the Unchained Blockchain Conference,
// the APIC final pitch). Programs change with each board: keep this list
// honest by deleting anything that no longer runs.
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
        title: "Kick-Off Night & the 101 Series",
        blurb: "Your introduction to how the tech industry works and how to break in.",
      },
      {
        title: "Tech Bytes",
        blurb: "Short, focused sessions on one topic or skill at a time.",
      },
      {
        title: "Function deep-dives",
        blurb: "Sales, business development, operations and the other roles beyond product and engineering.",
      },
      {
        title: "Emerging-tech workshops",
        blurb: "Crypto & Web3 101 and other topics at the frontier of the industry.",
      },
      {
        title: "Flagship conferences",
        blurb: "Past events include the Anderson Emerging Technology Summit and the Unchained Blockchain Conference.",
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
        title: "Technology Career Night",
        blurb: "Meet recruiters from 20+ tech companies in a single evening.",
      },
      {
        title: "Career mixers",
        blurb: "Relaxed networking evenings with recruiters and fellow students.",
      },
      {
        title: "Tech Treks",
        blurb: "Visit companies and meet the teams behind the products.",
      },
      {
        title: "Alumni mentorship",
        blurb: "Learn from Anderson alumni who are already working in tech.",
      },
      {
        title: "Cross-club events",
        blurb: "Joint programming with other Anderson groups, including women in tech and data science, plus founder talks like Founding a Tech Startup.",
      },
    ],
    photo: null,
  },
  {
    id: "career-development",
    label: "Career development",
    heading: "Practice until the real thing feels routine.",
    body: "Interviews are a skill. We run the workshops, case practice and hands-on projects that turn interest into offers, and members get a library of recruiting resources on top.",
    programs: [
      {
        title: "Interview prep & case workshops",
        blurb: "Structured practice for behavioral and case interviews.",
      },
      {
        title: "Days-on-the-Job",
        blurb: "See what a role is really like before you commit to it.",
      },
      {
        title: "Anderson Product Innovation Challenge",
        blurb: "A product design competition that ends in final pitches: real work to talk about in interviews.",
      },
      {
        title: "Members-only resource library",
        blurb: "Recruiting guides, trackers and upcoming events, available after you sign in.",
      },
    ],
    photo: null,
  },
];
