# AnderTech website

Website for AnderTech (official name: Tech Business Association at Anderson, confirm with Anderson student affairs), a UCLA Anderson MBA club that helps students recruit into the tech industry.

The club board changes every year and the maintainers are MBA students, not full-time engineers. **Optimize for simplicity, low cost, and easy handover over cleverness.**

## Deadline and current phase

- **Club fair: 24 September 2026.** Ship a public front door first.
- **Phase 1 (now, public only):** landing page, board section, event calendar embed, "join" button linking to the welcome survey (Google Form) -- hidden for now, see the Auth section's landing-page note -- and club contact info.
- **Phase 2 (after the fair):** public candidate resources and job board links, tech news feed (RSS at build time, optional).
- **Phase 3 (later):** community features (member directory, posts, profiles). **Do not build any of this until asked.** Member *login* itself, plus a minimal members-only resources list and a small `/admin` page, was pulled forward by request -- see the Auth section below. It uses a database (Vercel Postgres), which is why Rule 6/Stack's "ask before adding a database" line was already satisfied for this specific, narrow use.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Hosting: Vercel (free tier), connected to the GitHub repo, free subdomain for now
- No database for the public Phase 1 content -- it's still all in `/content`. The one exception is Vercel Postgres, added by explicit request for the members-only area (see the Auth section below): the membership list, resource links and their categories, members-only events (`events` table, added by request; the public events calendar is still Google Calendar), and account requests (`access_requests` table, added by request). Don't add another database, or use this one for anything else, without asking.

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

Login gates only `/members` and `/admin`. The public landing page, board, events, and join button are untouched.

- **Sign-in:** Google (Auth.js / `next-auth` v5). JWT sessions.
- **Who can sign in:** an email allow-list in **Vercel Postgres** (`members` table -- see `schema.sql` for the one-time table setup). Read/written via `@vercel/postgres` in `src/lib/members-db.ts`.
  - A database was chosen over the earlier Excel/Microsoft Graph plan because that needed a Microsoft 365 tenant admin to grant admin consent, which wasn't available. Postgres provisions directly in the Vercel dashboard (Storage tab) the project is already connected to -- no separate admin approval.
- **To add or remove a member, resource link, resource category or members-only event: use `/admin`.** It has a left menu: `/admin/members`, `/admin/categories`, `/admin/resources`, `/admin/events`. Never edit the database with raw SQL as the normal workflow; `/admin` is the intended interface. `schema.sql` is only for one-time setup and migrations.
- **Who is an admin:** an email in the `ADMIN_EMAILS` env var (a short, permanent backstop that can't be removed from the UI, so the club can't lock itself out) **or** a member holding the `admin` role in the `member_roles` table (granted on `/admin/members`). See `src/lib/admin.ts` (`isAdmin`, `isEnvAdminEmail`).
- **Member roles:** a member can hold several. The fixed list is in `src/lib/roles.ts` (`club-member`, `admin`); new members default to `club-member`, and a member is never left with no role. A DB-only admin can't remove their own admin role or themselves (env admins are unaffected).
- **Every admin page and every admin server action calls `requireAdmin()`** (`src/lib/require-admin.ts`). The `/admin` layout's check only draws the sidebar: layouts don't re-render on client navigation and server actions are reachable by direct POST, so neither the layout nor middleware (which only confirms "some signed-in session") is a sufficient gate.
- **Admin server actions live in `actions.ts` files with `"use server"` at the top** (one per section), not inline in the page component. Inline actions capture every local variable of the component as a bound argument, and a plain function can't be serialized that way -- an earlier version declared a helper inside the page and every form saved its data and then returned a 500.
- **Postgres returns `bigserial` ids as strings.** Compare with `Number(...)` (an Edit link once opened an empty form because `"5" === 5` is false).
- **`ADMIN_EMAILS` admins can always sign in**, even before being added to the `members` table -- otherwise nobody could ever reach `/admin` to bootstrap the list in the first place. See `src/auth.ts`'s `signIn` callback. Admins granted the role in the database are members already, so they pass the normal check.
- **Member-only resource links** (e.g. the recruiting dashboard) live in the `resources` table, each pointing at one row of the `categories` table (which sets the group order on `/members`), edited on `/admin`, shown on `/members`. Resources with `featured = true` (the "Pin to Start here" checkbox) show as big cards at the top of `/members`. Members-only events live in the `events` table and show on `/members/events` (upcoming only, LA time).
- **Theme:** light/dark is a `dark` class on `<html>` (Tailwind `@custom-variant` in `globals.css`), not the bare `prefers-color-scheme` media query. A small script in `src/app/layout.tsx` sets it before first paint from `localStorage.theme`, falling back to the device setting; `src/components/theme-toggle.tsx` flips it and saves the choice. The toggle holds no React state (both icons render, CSS shows one) so server and client HTML always match. New components should use `dark:` utilities as usual.
- **Header:** static and session-free (see the comment in `src/components/header.tsx`). The static HTML shows a "Login" link to `/sign-in`; `src/components/header-actions.tsx` then asks `GET /api/me` (`{signedIn, admin}`, no-store) from the browser after load and swaps in "Members" (to `/members`) for signed-in visitors and adds the "Admin console" link for admins, so public pages stay prerendered. A signed-in member briefly sees "Login" before the check returns. `/api/me` is a convenience for the links only; `/members` and `/admin` still enforce permission themselves (`isApprovedMember`, `requireAdmin()`).
- **Account requests:** the public `/request-access` page takes a name and an address at `site.requestEmailDomain` (`g.ucla.edu`, in `content/site.ts`); admins approve or reject on `/admin/requests` (the menu item shows a pending-count badge). Approving adds the email to `members` with the `club-member` role in one SQL statement (`src/lib/access-requests.ts`); the person then signs in with that Google account, which is what actually proves they own the address. **Nobody is emailed** (there is no email service) -- admins tell people themselves. Because the form is public it is defensive: strict address validation (exact domain, one `@`, plain local part), a hidden honeypot field, a cap of 500 pending requests, and the *same* "received" answer whether or not the address is already a member (so it can't be used to discover who is one). One row per email; a rejected person, or an approved one who was later removed, can ask again (back to pending). The table holds names and emails of prospective members: database only, never the repo. Server actions that approve/reject call `requireAdmin()` and revalidate the whole `/admin` layout so the badge updates.
- **Sign-in page** (`/sign-in`): the Airy hero band with a centered card and a Google button. The band's drawing comes in two sizes (`art` prop on `HeroBand`, `src/components/hero-band.tsx`): the default `compact` (complete, small, right side) for the landing and members heroes, and `large` for the sign-in and request-access pages via `AuthShell` -- a big square version parked so only its left ~40% is on screen (`left-full` plus a -40% shift; smaller on phones), with 1px non-scaling strokes so the lines stay crisp at any size. It also renders Auth.js's `?error=AccessDenied` message. If the visitor is already signed in as an approved member it redirects to `/members` (the same `isApprovedMember` test `/members` uses, so the two can never bounce back and forth). A signed-in visitor who is *not* on the member list (an `ADMIN_EMAILS` admin who hasn't added themselves, or someone removed since signing in) stays on the page with an "Open the admin console" link (admins) and a sign-out button.
- **Feedback email:** the members-page help card is a plain `mailto:` to `site.contactEmail` with subject `site.feedbackSubject` + ": " (no backend, no secrets); the address is also printed for devices without a mail app.
- **The landing page** (`/`) uses the same Airy hero band as `/members` (`src/components/hero-band.tsx`, `landing-hero.tsx`). The "Join" button is intentionally not rendered for now (`links.joinSurvey` is kept in content). Board members show initials, not photos, until each person consents to a photo.
- **`/members` is a dashboard home**, built from those tables: welcome band (first name from the Google session, countdown to the next event, computed in LA time), Next up (3 events), Start here (pinned), Browse (search + category chips), help card, and an admin card for admins. The components are in `src/app/members/_components/`. Search and category filtering are server-side (`?q=` and `?cat=`, a plain GET form and links) so they work without JavaScript. A resource's icon and type label (Sheet, Form, Dashboard, ...) are detected from its URL in `src/lib/resource-kind.ts`, so no "type" is stored; category icons are picked by name there too, with a fallback for new categories. The header's width follows the route via a tiny client component (`src/components/header-frame.tsx`) that reads the URL, never the session, so public pages stay static. The files behind the links stay in Drive/SharePoint with restricted sharing; the members-only event data is never committed to the repo (no seed SQL in git). **The recruiting dashboard's real access control is still Looker Studio's own sharing list**, per the rule above -- this site's login is a convenience layer, not the security boundary for that resource. Share the dashboard with approved members' Google accounts (or a Google Group) in Looker Studio itself.
- **Env vars:** see `.env.local.example`. Set for real in Vercel's dashboard, never in the repo.
- **Dependencies added for this:** `next-auth`, `@vercel/postgres`.
- **Gotchas hit while building this, verified locally (Next.js 16.3.5) -- worth checking before assuming they're fixed in a newer version:**
  - **The route-protection file must be named `middleware.ts`, not `proxy.ts`.** This Next.js version's own bundled docs describe a middleware -> proxy rename, but Turbopack doesn't actually wire up `proxy.ts` here -- it silently builds an empty middleware manifest and the file never runs, in both `next dev` and `next build`/`next start`. `middleware.ts` (the "deprecated" name) is what actually works. Matches [vercel/next.js#93328](https://github.com/vercel/next.js/issues/93328).
  - **Don't set `runtime: "nodejs"` in `middleware.ts`'s config.** It also silently breaks the manifest the same way. Middleware here runs on the Edge runtime (the working default), which is why it can't import anything that needs Node's `crypto` -- see the next point.
  - **`middleware.ts` must not import anything that transitively needs Node-only APIs** (a database client is a likely future example) -- merely importing such a module can crash at module-evaluation time on the Edge runtime, even if the function using it is never called. Verified locally with an earlier Node-only auth dependency this project no longer uses. That's why the Auth.js config is split: `src/auth.config.ts` (Edge-safe, no database access) is what `middleware.ts` builds its own `NextAuth()` instance from, for a cheap "is there a session" check; `src/auth.ts` layers the real membership check on top, for the API route handler and pages (Node.js runtime, unaffected). The live "is this email still approved/admin" re-check therefore happens in `src/app/members/page.tsx` and `src/app/admin/page.tsx`, not in middleware.
  - `trustHost: true` is needed even for local `next start` testing, not just deployment -- without it Auth.js logs `UntrustedHost` and treats every request as session-less.

## Rules

1. **Everything in this repo is public.** No secrets, no member names or emails, no survey responses, no private links. Keep `.env*` in `.gitignore` from the first commit, and never put secrets in `NEXT_PUBLIC_` variables.
2. **Content in data files, not JSX.** Board members, links, and events go in `/content` (JSON or TypeScript), so a future board can edit them without touching components. The same applies to images: one file in `public/`, one path in `/content`, one component that renders it (see `content/site.ts` → `logo`, `src/components/logo.tsx`, `src/components/header.tsx` for the pattern). Never hardcode an image path directly in a page — swapping the file, or editing its `/content` entry, should be enough to update it everywhere it's used.
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
- Board photos and bios (names/roles are in `content/board.ts`, sourced from AnderTech's Anderson club page as a starting point -- verify it's current; photos/bios still need each person's consent per Rule 7)
- Event calendar embed URL (`content/links.ts` → `calendarEmbed`)
- Whether an existing ~1000-person member roster already exists somewhere to bulk-import via `/admin`, or the list is built from scratch one add at a time
- Who is eligible for membership, and who approves additions via `/admin` (the mechanism exists now -- add/remove through that page -- but the approval policy, and who's actually in `ADMIN_EMAILS`, is still up to the board)
