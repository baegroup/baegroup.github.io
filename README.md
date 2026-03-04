# Bae Lab Website (React + shadcn/ui + Obsidian Content)

Bilingual (`/en`, `/ko`) website for **Bae Lab for Electrochemical Energy Storage**.
The site runs on **React + Vite + Tailwind + shadcn/ui** and deploys with GitHub Pages.

## Tech Stack

- React 18 + React Router
- Vite
- Tailwind CSS
- shadcn-style UI components
- Markdown content pipeline (`content/*.md` -> generated JSON)

## Obsidian Workflow

1. Open `/content` as an Obsidian Vault.
2. Edit Markdown files in `/content/en` and `/content/ko`.
3. Publish in one command:

```bash
npm run publish -m "Update homepage content"
```

This command runs content generation, commit, and push automatically.

If you want generation only:

```bash
npm run publish:dry
```

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

- `/content/*/*.md`: Obsidian-editable site text source
- `/scripts/build-content.mjs`: Markdown -> JSON generator
- `/scripts/publish-content.mjs`: one-command content publish tool
- `/src/content/site-content.generated.json`: generated content (auto)
- `/src/content/site-content.js`: content export bridge
- `/src/App.jsx`: route configuration (`/en`, `/ko`)
- `/src/layouts/SiteLayout.jsx`: shared layout/header/footer
- `/src/components/site/SiteContactSection.jsx`: global contact section
- `/src/pages/*`: page implementations
- `/public/data/members.json`: member data
- `/public/data/publications.json`: publication data
- `/.github/workflows/pages.yml`: GitHub Pages build/deploy workflow

## GitHub Pages

1. Repository Settings > Pages > Source = **GitHub Actions**
2. Push to `main`
3. Confirm `Deploy GitHub Pages` workflow success
