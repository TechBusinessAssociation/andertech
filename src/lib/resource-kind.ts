export type IconName =
  | "doc"
  | "sheet"
  | "form"
  | "chart"
  | "video"
  | "slides"
  | "folder"
  | "link"
  | "arrow"
  | "search"
  | "cap"
  | "brief"
  | "people";

export type ResourceKind = { icon: IconName; label: string };

const LINK: ResourceKind = { icon: "link", label: "Link" };

// Works out what a link points at from its address alone, so the board never
// has to enter a "type" -- the icon and label follow the URL they paste.
export function resourceKind(url: string): ResourceKind {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return LINK;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const path = parsed.pathname.toLowerCase();

  if (host === "docs.google.com") {
    if (path.startsWith("/spreadsheets")) return { icon: "sheet", label: "Sheet" };
    if (path.startsWith("/forms")) return { icon: "form", label: "Form" };
    if (path.startsWith("/presentation")) return { icon: "slides", label: "Slides" };
    if (path.startsWith("/document")) return { icon: "doc", label: "Doc" };
  }
  if (host === "forms.gle") return { icon: "form", label: "Form" };
  if (host === "lookerstudio.google.com" || host === "datastudio.google.com") {
    return { icon: "chart", label: "Dashboard" };
  }
  if (
    host === "youtu.be" ||
    host.endsWith("youtube.com") ||
    host.endsWith("vimeo.com")
  ) {
    return { icon: "video", label: "Video" };
  }
  if (host === "drive.google.com") {
    return path.includes("/folders")
      ? { icon: "folder", label: "Folder" }
      : { icon: "doc", label: "File" };
  }
  if (host.endsWith("sharepoint.com") || host === "1drv.ms") {
    return { icon: "doc", label: "File" };
  }

  if (path.endsWith(".pdf")) return { icon: "doc", label: "PDF" };
  if (/\.(xlsx?|csv)$/.test(path)) return { icon: "sheet", label: "Sheet" };
  if (/\.pptx?$/.test(path)) return { icon: "slides", label: "Slides" };
  if (/\.docx?$/.test(path)) return { icon: "doc", label: "Doc" };
  if (/\.(mp4|mov)$/.test(path)) return { icon: "video", label: "Video" };
  return LINK;
}

// Icon for a category tile, by name, with a neutral fallback so a category the
// board adds later still gets one.
export function categoryIcon(name: string): IconName {
  switch (name.trim().toLowerCase()) {
    case "prepare":
      return "cap";
    case "find roles":
      return "brief";
    case "peers":
      return "people";
    case "club insights":
      return "chart";
    default:
      return "folder";
  }
}
