# AnderTech website

Public website for AnderTech, a UCLA Anderson MBA club that helps students recruit into tech. Built with Next.js, TypeScript and Tailwind CSS. The landing page is fully public; a small `/members` area requires Google sign-in, checked against a membership list in a database (see "Members area" below) -- there's no database involved in the public content, which still lives entirely in `content/`.

**Everything in this repo is public.** Never commit passwords, secrets, member names or emails, survey responses, or private links.

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # check for problems
npm run build    # production build; must pass before merging
```

## How to update the site

All editable text and links live in the `content/` folder. You do not need to touch anything in `src/`.

| To change | Edit |
|-----------|------|
| Club name, tagline, contact email | `content/site.ts` |
| Join survey link, calendar embed, social links | `content/links.ts` |
| Board members (name, role, bio, photo) | `content/board.ts` |
| Logo (header) | Replace `public/brand/logo.png` with a same-named file, or change the path in `content/site.ts` |
| Favicon (browser tab) | Replace `src/app/favicon.ico` |
| Brand colors | `src/app/globals.css`, the `--color-brand-*` values |

A link set to `null` is hidden or disabled on the site. Only add a board member's name, bio or photo with that person's consent. Board photos go in `public/board/`. See `design-reference/README.md` for where the current logo and colors came from.

### Making a change

1. Create a branch: `git switch -c feature/<short-name>`
2. Edit the file, then run `npm run lint` and `npm run build`.
3. Commit, push, and open a pull request into `main`. Do not push to `main` directly.
4. Merging to `main` redeploys the live site automatically.

## Members area (login)

`/members` requires signing in with Google, checked against an approved-member list. `/admin` is the same, plus an extra check (see below). Nothing about day-to-day use of either involves editing code.

**To add or remove a member, resource link, resource category or members-only event: go to `/admin`** (there's an "Admin" link on `/members` for admins). A menu down the left has **Members**, **Resources → Categories / Resources**, and **Events**. No SQL, no spreadsheet.

- **Who can use `/admin`:** emails in the `ADMIN_EMAILS` env var (a permanent backstop -- keep at least one there so the club can never lock itself out), plus any member you give the **Admin** role.
- **Members:** add many at once (paste emails, tick their roles -- Club member is ticked by default). The list below shows 10 at a time with Previous/Next and a search box (searches every member, not just the visible page). **Edit roles** on a row lets you give someone several roles, e.g. Club member + Admin. You can't remove yourself or take the Admin role from yourself.

- **Categories** are the groups on `/members` (e.g. Prepare, Find roles). The number next to each sets the order, lowest first; leave gaps (10, 20, 30) so you can slot a new one in. A category can't be removed while resources still use it.
- **Resources** are links (Drive, Looker Studio, a Google Form, ...). Each one belongs to a category. The table shows each label as a clickable link; click the eye icon to see the full URL. Use **Edit** on a row to change it.
- **Events** appear on `/members/events`: upcoming ones only, grouped by week, times in Pacific. Past events drop off automatically but stay in `/admin` until removed.
- **Giving a new member access to the linked files is a second step.** Adding their email on `/admin` lets them sign in to the site; the Drive files also need to be shared with them (ideally via a Google Group), because the site can't unlock those files.

Important about resource links: **that list is a convenience directory, not real security for whatever it links to.** The recruiting dashboard's real access control is Looker Studio's own sharing settings -- share it with each approved member's Google account (or a Google Group) there too, or this login doesn't actually stop anyone with the link from opening it.

**One-time setup**, done once and then forgotten about:
1. **Google Cloud Console:** OAuth consent screen (External audience, Published -- not "Testing," which caps sign-ins at 100 people) → OAuth 2.0 Client ID (Web application). Redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://<your-domain>/api/auth/callback/google`.
2. **Vercel dashboard → Storage → Create Database → Postgres**, connect it to this project (this auto-injects `POSTGRES_URL`). No separate signup or admin approval needed beyond your existing Vercel access.
3. Run `schema.sql` (in this repo) once against that database -- easiest from the database's own Query tab in the Vercel dashboard. It is safe to re-run, so if `schema.sql` gains new tables later (as it did for categories and events), just run it again.
4. Set the env vars in `.env.local.example` for real, in Vercel's dashboard (Project → Settings → Environment Variables) -- never in this repo. Include your own email in `ADMIN_EMAILS` so you can reach `/admin` to add everyone else.

## Where things live

| Thing | Where |
|-------|-------|
| Code | GitHub: `TechBusinessAssociation/andertech` |
| Hosting | Vercel (connected to the GitHub repo) |
| Welcome survey | Google Form (link in `content/links.ts`) |
| Events | Public Google Calendar, embedded on the site. Edit events in Google Calendar, not in code. |
| Recruiting dashboard | Looker Studio (access controlled by its own sharing list; never embed it here). Linked from `/members`, but that link isn't what protects it. |
| Members-only resources | Files live in Google Drive (or SharePoint) with restricted sharing. `/members` shows a directory of links grouped by category (edited on `/admin`), not the files themselves. |
| Members-only events | Vercel Postgres (`events` table), edited on `/admin`, shown on `/members/events`. The public calendar above is separate. |
| Membership list | Vercel Postgres, edited via `/admin`. Not in this repo -- see "Members area" above. |
| Domain | Not set up yet. Using the free `*.vercel.app` address. |

Account logins and passwords belong in the club's shared password manager, not in this repo.
