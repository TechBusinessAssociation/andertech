# Design reference (not live)

Source mockups kept for style reference. **Neither file here is wired into
the app** — no page imports or links to these files, and they are not in
`/public`, so they are never served by the site or shipped in the build.

## Status: confirmed, extracted assets live elsewhere

- The club's name, logo and use of "Anderson" branding are confirmed
  (see root `CLAUDE.md` → Rule 5).
- The logo and favicon actually used on the site are **derived from
  `web-asset-kit-mockup.png`** — cropped, given a transparent background,
  and saved separately as `public/brand/logo.png` (header) and
  `src/app/favicon.ico` (browser tab). Edit or replace those files to
  change the live logo; editing the files in this folder does nothing.
- The brand color palette (blue/gold/navy/sky/cream) was sampled from the
  swatches in `web-asset-kit-mockup.png` and is defined once, as Tailwind
  tokens, in `src/app/globals.css` (`--color-brand-*`).
- Both mockups are AI-generated compositions, not vector source files.
  If a cleaner source (SVG/AI/Figma export, or a proper transparent PNG)
  becomes available, replace `public/brand/logo.png` and
  `src/app/favicon.ico` directly — that's the only change needed; nothing
  else in the app references this folder.
- `hero-mockup.png` (full hero layout, with a UCLA Anderson building photo)
  hasn't been used for anything yet — kept as layout/style inspiration only.

## Files

| File | What it shows |
|------|----------------|
| `web-asset-kit-mockup.png` | Logo lockup, color palette (blue/gold/navy/sky/cream), hero background variants, a card/panel style — source for the live logo, favicon and color tokens |
| `hero-mockup.png` | A full hero-section layout: wordmark, headline, subhead, three feature pills, building photo — style reference only, not extracted from yet |
