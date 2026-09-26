// Board members. Add one entry per person, newest board each year.
// Only add a name, bio or photo with that person's consent.
//
// The home page shows the board group photo (`boardPhoto` below), then the
// leadership up front: any role starting with "President" or "EVP" is shown as
// leadership, and every other role (the vice presidents) goes in the
// collapsed "Vice presidents" list. Keep that wording in roles and the split
// works on its own; the order here is the order shown.
//
// This list (name + role only, no bios or photos) was sourced from
// AnderTech's official Anderson club page as a starting point:
// https://www.anderson.ucla.edu/about/clubs-and-associations/professional/tech-business-association-at-anderson-andertech
// Verify it's current before relying on it -- board membership changes
// every year, and this was a one-time snapshot.

export type BoardMember = {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
};

// The board group photo on the home page. One file in public/photos/, one path
// here. width/height are the file's real pixel size (it is shown uncropped so
// nobody is cut out of the group). Set to null to hide it. Update it, and get
// everyone's OK, each year when the board changes (Rule 7).
export const boardPhoto: {
  src: string;
  alt: string;
  width: number;
  height: number;
} | null = {
  src: "/photos/board-2026.avif",
  alt: "The AnderTech board posing together on an outdoor staircase",
  width: 2000,
  height: 671,
};

export const board: BoardMember[] = [
  { name: "Shreya Vishwanath", role: "President" },
  { name: "Shauty Arovah", role: "EVP of Recruiting" },
  { name: "Ateken Alba", role: "EVP of Learning and Development" },
  { name: "Nicholas Fong", role: "EVP of Community" },
  { name: "Charlotte Clark", role: "EVP of Operations, Finance and People" },
  { name: "Cemil Revan", role: "EVP of Alumni and External Partnerships" },
  { name: "Yuka Harano", role: "VP of Alumni Relations" },
  { name: "Chandni Mittal", role: "VP of Alumni Relations" },
  { name: "Reshmi Neogy", role: "VP of Alumni Relations" },
  { name: "Hershey Chadha", role: "VP of Easton Relations" },
  { name: "Abhishek Datta", role: "VP of Enterprise Relations" },
  { name: "Daniel Sam", role: "VP of Enterprise Relations" },
  { name: "Mallory Leeper", role: "VP of Startups" },
  { name: "Alberto Ruiz", role: "VP of Startups" },
  { name: "Hunter Francia", role: "VP of Admissions" },
  { name: "Krishna Mukkavilli", role: "VP of Community" },
  { name: "Jessica Lardenoit", role: "VP of Inclusive Excellence" },
  { name: "Jeffrey Yan", role: "VP of International Students" },
  { name: "Amy Lu", role: "VP of Marketing and Communications" },
  { name: "Jack Spencer", role: "VP of Program Relations" },
  { name: "Yerko Squadrito", role: "VP of Competitive Development" },
  { name: "Kady Ju", role: "VP of Competitive Development" },
  { name: "Livia Azevedo", role: "VP of Emerging Technology" },
  { name: "Kosi Ogbuli", role: "VP of Industry Education" },
  { name: "Brian Bagdasarian", role: "VP of Tech Skills" },
  { name: "Lony Chang", role: "VP of Board Operations and Experience" },
  { name: "Ashvrya Sharma", role: "VP of Operations and Member Experience" },
  { name: "Rashmi Movva", role: "VP of Professionalism" },
  { name: "Andy Ho", role: "VP of Strategic Finance" },
  { name: "Utkarsh Rawat", role: "VP of Tech Operations" },
  { name: "Jennifer Leong", role: "VP of Sponsorships" },
  { name: "Mary Wang", role: "VP of Application Readiness" },
  { name: "Samuel Arteaga", role: "VP of Candidate Resources and Insights" },
  { name: "Nimit Gupta", role: "VP of Candidate Resources and Insights" },
  {
    name: "Fernando Augusto Zitta Kluppel",
    role: "VP of Interview Excellence",
  },
];
