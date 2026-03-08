# Bae Lab Website (React + shadcn/ui + Obsidian Content)

English-only website for **Bae Lab**.
The site runs on **React + Vite + Tailwind + shadcn/ui** and deploys with GitHub Pages.

## Tech Stack

- React 18 + React Router
- Vite
- Tailwind CSS
- shadcn-style UI components
- Markdown content pipeline (`content/*.md` -> generated JSON)

## Obsidian Workflow

1. Open `/content` as an Obsidian Vault.
2. Edit Markdown files in `/content/en`.
3. If needed, reuse template notes from `/content/_templates/en`.
4. Publish in one command:

```bash
npm run publish -m "Update homepage content"
```

This command runs content generation, commit, and push automatically.

If you want generation only:

```bash
npm run publish:dry
```

## Home Media Update

Replace these fixed files to update the homepage visuals:

- `public/assets/img/home/hero/cover.[jpg|jpeg|png|webp]`
- `public/assets/img/home/research/area-1.[jpg|jpeg|png|webp]`
- `public/assets/img/home/research/area-2.[jpg|jpeg|png|webp]`
- `public/assets/img/home/research/area-3.[jpg|jpeg|png|webp]`
- `public/assets/img/home/news/featured.[jpg|jpeg|png|webp]`
- `public/assets/img/home/join/team.[jpg|jpeg|png|webp]`

No code or path changes are needed if base filenames stay the same.

## Research Media and Funding Logos

Research page also supports fixed base names with auto extension fallback:

- extension order: `.webp` -> `.png` -> `.jpg` -> `.jpeg`
- area image path: `public/assets/img/research/areas/<base-name>.<ext>`
- funding logo path: `public/assets/img/research/funding/<base-name>.<ext>`

Base names come from `content/en/research.md`:

- each `cards` row (3rd field) for area image base name
- each `fundingItems` row (2nd field) for funding logo base name

## Home Motion and News Layout

- Homepage sections use subtle reveal motion whenever each section re-enters the viewport.
- If `prefers-reduced-motion` is enabled, motion is automatically disabled.
- Home news is rendered as one compact board: `1 featured + 5 rows`.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

- `/content/en/*.md`: Obsidian-editable site text source
- `/content/_templates/en/*.md`: reusable template notes for Obsidian
- `/scripts/build-content.mjs`: Markdown -> JSON generator
- `/scripts/publish-content.mjs`: one-command content publish tool
- `/src/content/site-content.generated.json`: generated content (auto)
- `/src/content/site-content.js`: content export bridge
- `/src/App.jsx`: route configuration
- `/src/layouts/SiteLayout.jsx`: shared layout/header/footer
- `/src/components/site/SiteContactSection.jsx`: global contact section
- `/src/pages/*`: page implementations
- `/public/data/team.json`: team profile data
- `/public/data/publications.json`: publication data
- `/public/assets/img/home/*`: homepage media (replace by fixed filename)
- `/public/assets/img/research/areas/*`: research area media
- `/public/assets/img/research/funding/*`: funding logos
- `/.github/workflows/pages.yml`: GitHub Pages build/deploy workflow

## GitHub Pages

1. Repository Settings > Pages > Source = **GitHub Actions**
2. Push to `main`
3. Confirm `Deploy GitHub Pages` workflow success
