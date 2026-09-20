# AnderTech website

Website for AnderTech (official name: Tech Business Association at Anderson, confirm with Anderson student affairs), a UCLA Anderson MBA club that helps students recruit into the tech industry.

The club board changes every year and the maintainers are MBA students, not full-time engineers. **Optimize for simplicity, low cost, and easy handover over cleverness.**

## Deadline and current phase

- **Club fair: 24 September 2026.** Ship a public front door first.
- **Phase 1 (now, public only):** landing page, board section, event calendar embed, "join" button linking to the welcome survey (Google Form), club contact info.
- **Phase 2 (after the fair):** public candidate resources and job board links, tech news feed (RSS at build time, optional).
- **Phase 3 (later):** community features (member login, directory, posts). Needs a database and auth. **Do not build any of this until asked.**

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Free hosting tier (Vercel or Cloudflare Pages, TBD), free subdomain for now
- No database and no auth in Phase 1. Do not add either without asking.

## Commands

- `npm run dev`: local dev server
- `npm run lint`: lint
- `npm run build`: production build (must pass before any commit or PR)

## What lives where

- **Welcome survey:** Google Form, linked from the site. Open to anyone with the link, so no sign-in is needed at the fair.
- **Reporting survey and recruiting dashboard:** Google Form plus Looker Studio. The site links to them at most. **Never embed the dashboard or any raw response data on a public page.** Access is controlled by Looker Studio's own sharing list.
- **Events:** an embedded public Google Calendar. The board edits events in Google Calendar, not in code.
- **Members-only recruiting resources:** these are **not in this repo and not on this site yet.** They live in a private SharePoint library until the site has real server-side login. Do not add members-only content to the repo, the frontend bundle, or a static export.

## Rules

1. **Everything in this repo is public.** No secrets, no member names or emails, no survey responses, no private links. Keep `.env*` in `.gitignore` from the first commit, and never put secrets in `NEXT_PUBLIC_` variables.
2. **Content in data files, not JSX.** Board members, links, and events go in `/content` (JSON or TypeScript), so a future board can edit them without touching components.
3. **Mobile first.** Most visitors arrive by scanning a QR code on a phone. Check every change at phone width, and keep pages light and fast.
4. **Accessible by default.** Semantic HTML, alt text, sufficient contrast, keyboard navigation.
5. **Branding:** do not use UCLA or Anderson logos, marks, or "ucla" in domain names until the club has confirmed Anderson's branding rules. Use the club's own name and logo.
6. **Keep dependencies few.** Prefer built-in Next.js features. Ask before adding a package.
7. **Board photos and bios** are added only with the person's consent.

## How to work

- For anything bigger than a small edit, **propose a plan first** and wait for a go-ahead.
- One feature per branch (`feature/<name>`), small commits, clear messages. Open a pull request into `main` and do not push to `main` directly.
- Run `npm run lint` and `npm run build` before committing.
- Explain non-obvious choices in a short code comment or in the PR description.
- If a request would break a rule above (for example, putting members-only content on the public site), say so and suggest an alternative instead of doing it.

## Handover

Keep `README.md` current with: how to run the site, how to update board members, links, and events, and where each external tool lives (Google Form, Google Calendar, Looker Studio, SharePoint, hosting, domain). Account details and passwords do **not** go in this repo. They belong in the club's shared password manager.

## Open decisions (ask the user, don't guess)

- Official club name and logo
- Domain name (free subdomain for now; the QR code must point at a URL that stays valid, or at a redirect we control)
- Hosting provider
- Board list, roles, and photos
- Who is eligible for membership, and who approves it (needed before any members-only features)
