# Bae Lab Website (React + shadcn/ui)

Bilingual (`/en`, `/ko`) website for **Bae Lab for Electrochemical Energy Storage**.
The site now runs on **React + Vite + Tailwind + shadcn/ui** and deploys to GitHub Pages with GitHub Actions.

## Tech Stack

- React 18 + React Router
- Vite
- Tailwind CSS
- shadcn/ui style components (`Button`, `Card`, `Badge`, `Tabs`)

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

- `/src/App.jsx`: route configuration (`/en`, `/ko`) with Home, Members, Research, Publications, News
- `/src/layouts/SiteLayout.jsx`: shared layout/header/footer
- `/src/components/site/SiteContactSection.jsx`: global contact section rendered at the bottom of every page
- `/src/pages/*`: page implementations
- `/src/components/ui/*`: shadcn-style UI components
- `/src/components/site/*`: site-specific UI blocks
- `/src/lib/data.js`: JSON loader and formatting logic
- `/public/data/members.json`: member data
- `/public/data/publications.json`: publication data
- `/.github/workflows/pages.yml`: GitHub Pages build/deploy workflow

## Data Contracts

### `public/data/members.json`

```json
{
  "id": "bae-jaehyeong",
  "name": { "en": "Jaehyeong Bae", "ko": "배재형" },
  "role": "PI|Researcher|Graduate|Undergraduate|Alumni",
  "status": "current|alumni",
  "program": "PhD|MSPhD|MS|BS|Staff",
  "email": "jbae@khu.ac.kr",
  "website": "https://www.baelab.khu.ac.kr",
  "interests": { "en": ["Electrolyte Design"], "ko": ["전해질 설계"] },
  "photo": "",
  "startYear": 2023,
  "endYear": null
}
```

### `public/data/publications.json`

```json
{
  "id": "2025-ees-data-science-assb",
  "year": 2025,
  "type": "journal|conference|preprint|patent",
  "title": { "en": "Paper Title", "ko": "논문 제목" },
  "authors": ["Author A", "Author B"],
  "venue": "Journal Name",
  "doi": "",
  "url": "",
  "labAuthors": ["bae-jaehyeong"],
  "featured": true
}
```

## GitHub Pages

1. Repository Settings > Pages > Source = **GitHub Actions**
2. Push to `main`
3. Confirm `Deploy GitHub Pages` workflow success
