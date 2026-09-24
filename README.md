# AnderTech website

Public website for AnderTech, a UCLA Anderson MBA club that helps students recruit into tech. Built with Next.js, TypeScript and Tailwind CSS. No database. The landing page is fully public; a small `/members` area requires Google sign-in, checked against a membership list kept outside this repo (see "Members area" below).

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

`/members` requires signing in with Google, checked against an approved-member list. Nothing about this involves editing code.

**To add or remove a member:** open the club's membership Excel workbook (on OneDrive for Business / SharePoint -- ask the board for the file if you don't have it) and edit the `Members` tab -- one email per row, inside the `MembersTable` table. Type into the row right after the last one so it's included in the table; don't insert rows in the middle in a way that breaks the table's range. Changes take effect without a redeploy: a new member can sign in within about a minute, and a removed member's access lapses within a day at the outside.

**To add or remove a member-only resource link** (e.g. the recruiting dashboard): same workbook, `Resources` tab, one `Label`/`Url` pair per row in `ResourcesTable`. Important: **this list is a convenience directory, not the dashboard's actual security.** The recruiting dashboard's real access control is Looker Studio's own sharing settings -- share it with each approved member's Google account (or a Google Group) there too, or this login doesn't actually stop anyone with the link from opening it.

**One-time setup**, done once and then forgotten about:
1. **Google Cloud Console:** OAuth consent screen (External audience, Published -- not "Testing," which caps sign-ins at 100 people) → OAuth 2.0 Client ID (Web application). Redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://<your-domain>/api/auth/callback/google`.
2. **Azure Portal (Entra ID):** register an app, create a client secret, and grant it the `Files.Read.All` application permission (or `Sites.Selected`, scoped to just the relevant SharePoint site) with admin consent. This needs someone with admin rights on the club's Microsoft 365 tenant.
3. Upload `template.xlsx` (in this repo) to OneDrive for Business or a SharePoint site -- not a personal/consumer OneDrive, Microsoft's Excel API doesn't support that.
4. Set the env vars in `.env.local.example` for real, in Vercel's dashboard (Project → Settings → Environment Variables) -- never in this repo.

## Where things live

| Thing | Where |
|-------|-------|
| Code | GitHub: `TechBusinessAssociation/andertech` |
| Hosting | Vercel (connected to the GitHub repo) |
| Welcome survey | Google Form (link in `content/links.ts`) |
| Events | Public Google Calendar, embedded on the site. Edit events in Google Calendar, not in code. |
| Recruiting dashboard | Looker Studio (access controlled by its own sharing list; never embed it here). Linked from `/members`, but that link isn't what protects it. |
| Members-only resources | Files still live in a private SharePoint library. `/members` shows a directory of links (from the workbook below), not the files themselves. |
| Membership list | An Excel workbook on the club's Microsoft 365 account (OneDrive for Business/SharePoint), read via Microsoft Graph. Not in this repo -- see "Members area" above. |
| Domain | Not set up yet. Using the free `*.vercel.app` address. |

Account logins and passwords belong in the club's shared password manager, not in this repo.
