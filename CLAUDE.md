# AnderTech website

Website for AnderTech (official name: Tech Business Association at Anderson, confirm with Anderson student affairs), a UCLA Anderson MBA club that helps students recruit into the tech industry.

The club board changes every year and the maintainers are MBA students, not full-time engineers. **Optimize for simplicity, low cost, and easy handover over cleverness.**

## Deadline and current phase

- **Club fair: 24 September 2026.** Ship a public front door first.
- **Phase 1 (now, public only):** landing page, board section, event calendar embed, "join" button linking to the welcome survey (Google Form), club contact info.
- **Phase 2 (after the fair):** public candidate resources and job board links, tech news feed (RSS at build time, optional).
- **Phase 3 (later):** community features (member directory, posts, profiles). Needs a database for that. **Do not build any of this until asked.** Member *login* itself, plus a minimal members-only resources list, was pulled forward by request -- see the Auth section below. It didn't need a database: JWT sessions, and the member list/resource links live in an Excel workbook outside this repo, not in a database.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Free hosting tier (Vercel or Cloudflare Pages, TBD), free subdomain for now
- No database in Phase 1. Auth (see below) was added by explicit request; it doesn't use one. Don't add a database without asking.

## Commands

- `npm run dev`: local dev server
- `npm run lint`: lint
- `npm run build`: production build (must pass before any commit or PR)

## What lives where

- **Welcome survey:** Google Form, linked from the site. Open to anyone with the link, so no sign-in is needed at the fair.
- **Reporting survey and recruiting dashboard:** Google Form plus Looker Studio. The site links to them at most. **Never embed the dashboard or any raw response data on a public page.** Access is controlled by Looker Studio's own sharing list.
- **Events:** an embedded public Google Calendar. The board edits events in Google Calendar, not in code.
- **Members-only recruiting resources:** the resource files themselves still live in a private SharePoint library, unchanged. `/members` (real server-side login now exists -- see Auth below) shows a curated list of links, which can point at SharePoint or Looker Studio -- it never embeds or hosts that content directly.

## Auth (members-only area)

Login gates only `/members`. The public landing page, board, events, and join button are untouched.

- **Sign-in:** Google (Auth.js / `next-auth` v5). JWT sessions -- no database.
- **Who can sign in:** an email allow-list on the `Members` tab of a private Excel workbook on the club's Microsoft 365 account (OneDrive for Business / SharePoint -- Graph's Excel API doesn't support personal/consumer OneDrive). Read server-side via Microsoft Graph, app-only (`@azure/msal-node`) -- no Microsoft user signs in for this, it's a service-to-service read. See `src/lib/members-workbook.ts`.
- **To add or remove a member:** edit the `Members` tab directly (one email per row, inside the `MembersTable` table -- it auto-expands, don't hand-edit a fixed range). No redeploy needed. A new member can sign in within ~60 seconds; a removed member's access lapses within 24 hours at worst -- that lag is intentional (keeps Graph API calls low at ~1000 members), not a bug.
- **Member-only resource links** (e.g. the recruiting dashboard) live on the `Resources` tab of the same workbook, shown on `/members`. **The recruiting dashboard's real access control is still Looker Studio's own sharing list**, per the rule above -- this site's login is a convenience layer, not the security boundary for that resource. Share the dashboard with approved members' Google accounts (or a Google Group) in Looker Studio itself.
- **Env vars:** see `.env.local.example`. Set for real in Vercel's dashboard, never in the repo.
- **Dependencies added for this:** `next-auth`, `@azure/msal-node`.
- **Gotchas hit while building this, verified locally (Next.js 16.3.5) -- worth checking before assuming they're fixed in a newer version:**
  - **The route-protection file must be named `middleware.ts`, not `proxy.ts`.** This Next.js version's own bundled docs describe a middleware -> proxy rename, but Turbopack doesn't actually wire up `proxy.ts` here -- it silently builds an empty middleware manifest and the file never runs, in both `next dev` and `next build`/`next start`. `middleware.ts` (the "deprecated" name) is what actually works. Matches [vercel/next.js#93328](https://github.com/vercel/next.js/issues/93328).
  - **Don't set `runtime: "nodejs"` in `middleware.ts`'s config.** It also silently breaks the manifest the same way. Middleware here runs on the Edge runtime (the working default), which is why it can't import anything that needs Node's `crypto` -- see the next point.
  - **`middleware.ts` must not import anything that transitively needs Node's `crypto`** (that includes `@azure/msal-node`, used for the membership check) -- merely importing such a module crashes at module-evaluation time on the Edge runtime, even if the function is never called. That's why the Auth.js config is split: `src/auth.config.ts` (Edge-safe, no membership check) is what `middleware.ts` imports for a cheap "is there a session" check; `src/auth.ts` layers the real membership check on top, for the API route handler and pages (Node.js runtime, unaffected). The live "is this email still approved" re-check therefore happens in `src/app/members/page.tsx`, not in middleware.
  - `trustHost: true` is needed even for local `next start` testing, not just deployment -- without it Auth.js logs `UntrustedHost` and treats every request as session-less.

## Rules

1. **Everything in this repo is public.** No secrets, no member names or emails, no survey responses, no private links. Keep `.env*` in `.gitignore` from the first commit, and never put secrets in `NEXT_PUBLIC_` variables.
2. **Content in data files, not JSX.** Board members, links, and events go in `/content` (JSON or TypeScript), so a future board can edit them without touching components.
3. **Mobile first.** Most visitors arrive by scanning a QR code on a phone. Check every change at phone width, and keep pages light and fast.
4. **Accessible by default.** Semantic HTML, alt text, sufficient contrast, keyboard navigation.
5. **Branding:** the club's name, logo and use of "Anderson" branding are confirmed with Anderson student affairs. The logo lives at `public/brand/logo.png` (header) and `src/app/favicon.ico` (browser tab); both are referenced from `content/site.ts`, so replacing either file (or editing that entry) updates the logo everywhere it's used. Brand colors are defined once, as Tailwind tokens, in `src/app/globals.css` (`--color-brand-*`). The source mockups the current logo/palette were extracted from live in `design-reference/` for reference; they are not wired into the app. "ucla" is still not to be used in the domain name — that's a separate, still-open decision below.
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

- Domain name (free subdomain for now; the QR code must point at a URL that stays valid, or at a redirect we control; whether "ucla" can appear in it is still unconfirmed even though the logo/branding itself is)
- Hosting provider
- Board list, roles, and photos
- Whether an existing ~1000-person member roster already exists somewhere, to point the Members workbook at, or a new one needs to be created from scratch
- Who is eligible for membership, and who approves additions to the Members workbook (the mechanism exists now -- edit the Excel file -- but the approval policy is still up to the board)
