# Advanced Computing Systems Lab Website

Bilingual (`/en`, `/ko`) static website for a university research lab, designed for GitHub Pages deployment.

## Quick Start

1. Clone the repository.
2. Open the site locally with any static server.
3. Push to `main` to trigger automatic GitHub Pages deployment.

### Local Preview

Use one of the following commands from the repository root:

```bash
python3 -m http.server 8000
```

or

```bash
npx serve .
```

Then visit `http://localhost:8000`.

## Project Structure

- `/index.html`: root redirect to English (`/en/`)
- `/en`, `/ko`: localized pages (Home, Members, Research, Publications, Contact)
- `/assets/css/main.css`: global styles and responsive layout
- `/assets/js/site.js`: navigation and language switch logic
- `/assets/js/data-loader.js`: members/publications data loading and rendering
- `/data/members.json`: member profile data
- `/data/publications.json`: publication data
- `/.github/workflows/pages.yml`: GitHub Pages deployment workflow
- `/CONTENT_GUIDE.md`: content update guide for non-developers

## Data Contracts

### `data/members.json`

```json
{
  "id": "kim-jh",
  "name": { "en": "Jihun Kim", "ko": "김지훈" },
  "role": "PI|Researcher|Graduate|Undergraduate|Alumni",
  "status": "current|alumni",
  "program": "PhD|MS|BS|Staff",
  "email": "jihun@example.edu",
  "website": "https://example.com",
  "interests": { "en": ["Robotics"], "ko": ["로보틱스"] },
  "photo": "/assets/img/members/kim-jh.jpg",
  "startYear": 2022,
  "endYear": null
}
```

### `data/publications.json`

```json
{
  "id": "2025-icra-kim",
  "year": 2025,
  "type": "conference|journal|preprint|patent",
  "title": { "en": "Paper Title", "ko": "논문 제목" },
  "authors": ["A. Kim", "B. Lee"],
  "venue": "ICRA 2025",
  "doi": "10.xxxx/xxxx",
  "url": "https://doi.org/...",
  "labAuthors": ["kim-jh"],
  "featured": true
}
```

## Deployment (GitHub Pages)

1. In GitHub repository settings, go to **Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`.
4. Confirm workflow success in **Actions** tab.

## Accessibility & Responsiveness Checklist

- Keyboard navigation works for menu and links.
- All images include `alt` text.
- Layout verified at 360px, 768px, and 1280px widths.
- Language switch is present on every page.
