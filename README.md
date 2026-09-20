# AnderTech website

Public website for AnderTech, a UCLA Anderson MBA club that helps students recruit into tech. Built with Next.js, TypeScript and Tailwind CSS. No database, no logins.

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

A link set to `null` is hidden or disabled on the site. Only add a board member's name, bio or photo with that person's consent. Board photos go in `public/board/`.

### Making a change

1. Create a branch: `git switch -c feature/<short-name>`
2. Edit the file, then run `npm run lint` and `npm run build`.
3. Commit, push, and open a pull request into `main`. Do not push to `main` directly.
4. Merging to `main` redeploys the live site automatically.

## Where things live

| Thing | Where |
|-------|-------|
| Code | GitHub: `TechBusinessAssociation/andertech` |
| Hosting | Vercel (connected to the GitHub repo) |
| Welcome survey | Google Form (link in `content/links.ts`) |
| Events | Public Google Calendar, embedded on the site. Edit events in Google Calendar, not in code. |
| Recruiting dashboard | Looker Studio (access controlled by its own sharing list; never embed it here) |
| Members-only resources | Private SharePoint library (not on this site) |
| Domain | Not set up yet. Using the free `*.vercel.app` address. |

Account logins and passwords belong in the club's shared password manager, not in this repo.
