// Copy and photos for the public landing page's newer sections (hero, "A year
// in the club", conferences, members preview, footer). Edit this file to change
// the words or swap a photo -- no component changes needed. Everything here is
// public. The pillar section reads content/programs.ts, the board section
// content/board.ts, and the dues links content/membership.ts.
//
// PHOTOS: one file in public/photos/, one path here. Only use photos of people
// who agreed to appear on a public website (Rule 7).


export type Photo = {
  src: string;
  alt: string;
  // The file's real pixel size (next/image needs it to reserve space).
  width: number;
  height: number;
};

export const hero = {
  // The headline is `lead` followed by `highlight`, which is shown in gold.
  lead: "From curious about tech to your ",
  highlight: "first offer.",
  photo: {
    src: "/photos/networking.webp",
    alt: "",
    width: 2000,
    height: 1500,
  } as Photo,
};

export const conferences = [
  {
    season: "Fall",
    title: "Tech + Society Conference",
    // null hides the theme block.
    theme: {
      label: "2026 theme",
      text: "Technology & Human Agency in the AI Era: How Leaders, Workers, & Institutions Prosper",
    } as { label: string; text: string } | null,
    copy: "A full day of programming, a networking lunch and two hands-on AI workshops: AI Essentials and AI Builder.",
    with: "With the Easton Technology Management Center",
  },
  {
    season: "Winter",
    title: "Innovate Tech Conference",
    theme: {
      label: "2026 theme",
      text: "Agentic AI: Competing, Differentiating, and Driving Customer Adoption at Scale",
    } as { label: string; text: string } | null,
    copy: "A half-day conference at Korn Convocation Hall. The 2026 edition took place on February 6.",
    with: "With the Easton Technology Management Center",
  },
  {
    season: "Spring",
    title: "Emerging Tech Conference",
    theme: null,
    copy: "Our annual spring conference, held with the Entrepreneur Association.",
    with: "With the Entrepreneur Association",
  },
];

// The numbers strip under the hero. All set by hand, so update them each year.
export const stats: { value: string | number; label: string }[] = [
  { value: "150+", label: "members" },
  { value: 3, label: "flagship conferences" },
  { value: "12+", label: "events a month, averaged over the year" },
];

export const pillarsIntro = {
  label: "What we do",
  heading: "Learn it. Meet them. Land it.",
  lede: "Three pillars, one path through the MBA: get fluent in tech, get in the room with the people who hire, then practice until the real thing feels routine.",
};

// "A year in the club": six photos that fly in as the page scrolls (wide
// screens; a plain grid on phones and tablets). The positions are in
// src/components/home/year-section.tsx and match these six, in this order.
// The first photo is also the blurred backdrop of the section.
export const year = {
  label: "A year in the club",
  heading: "Rooms worth being in.",
  intro:
    "Career Nights, treks to LA Tech Week, conferences, workshops, and the mixers in between.",
  tiles: [
    {
      label: "Networking",
      title: "Where it usually starts.",
      note: "First- and second-year socials, cross-school mixers with Marshall and Haas, and a quarterly mixer pairing MBAs with engineering, law, medical and film students.",
      credit: "AnderTech mixer",
      photo: {
        src: "/photos/year-lights.webp",
        alt: "String lights over an AnderTech mixer at dusk, with the club banner in the middle",
        width: 1100,
        height: 425,
      },
    },
    {
      label: "Conferences",
      title: "Three flagship days a year.",
      note: "Tech + Society each fall and Innovate each winter, both with the Easton Technology Management Center. Emerging Tech each spring with the Entrepreneur Association.",
      credit: "Korn Convocation Hall",
      photo: {
        src: "/photos/year-flags.webp",
        alt: "A wall of international flags above a full auditorium at Anderson",
        width: 640,
        height: 760,
      },
    },
    {
      label: "The room",
      title: "Everyone here is recruiting too.",
      note: "Second-years who just did it, classmates pivoting from the same place you are, and alumni who pick up the phone.",
      credit: "AnderTech mixer",
      photo: {
        src: "/photos/year-room.webp",
        alt: "Members gathered together at an evening mixer",
        width: 620,
        height: 830,
      },
    },
    {
      label: "Speakers",
      title: "Practitioners, on the record.",
      note: "Panels on tech and entertainment, sports, policy and global markets, plus founder AMAs and product demos on campus.",
      credit: "Tech + Society Conference",
      photo: {
        src: "/photos/year-speaker.webp",
        alt: "A speaker joining a conference session by video call on the main screen",
        width: 670,
        height: 500,
      },
    },
    {
      label: "Mentorship",
      title: "Someone a year ahead of you.",
      note: "Pair up at the start of the year, with check-ins along the way, plus coaching and mock interviews from second-years.",
      credit: "AnderTech mixer",
      photo: {
        src: "/photos/year-group.webp",
        alt: "A large group of members and guests posing together at an evening mixer",
        width: 860,
        height: 650,
      },
    },
    {
      label: "Workshops",
      title: "From curious to capable.",
      note: "The fall conference closes with hands-on AI workshops: AI Essentials, then AI Builder.",
      credit: "Tech + Society Conference",
      photo: {
        src: "/photos/year-applause.webp",
        alt: "An auditorium of students applauding at a conference session",
        width: 1100,
        height: 323,
      },
    },
  ],
};

// The members block. The preview card is an illustration, not real data: the
// names below are generic and the real content stays behind sign-in.
export const membersSection = {
  label: "Members",
  heading: "Join, and the recruiting playbook opens.",
  lede: "Recruiting guides and trackers, upcoming members-only events, a member directory and a showcase of what members build. All behind your UCLA Google sign-in.",
  preview: {
    tabs: ["Recruiting resources", "What's new", "Member Directory", "AnderTech Showcase"],
    pinnedLabel: "Pinned",
    pinnedTitle: "Recruiting dashboard",
    rows: ["Prepare", "Find roles", "Peers", "Club insights"],
    note: "Illustrative preview. Real content sits behind sign-in.",
    alt: "Illustration of the members area: four tabs, a pinned recruiting dashboard and resource categories",
  },
};

export const footerStatement = "The gateway to tech, for Anderson MBAs.";
