# Bae Lab Website (Kyung Hee University)

Bilingual (`/en`, `/ko`) static website for **Bae Lab for Electrochemical Energy Storage**.
The site is deployed with GitHub Pages via GitHub Actions.

## Quick Start

1. Clone the repository.
2. Run a local static server.
3. Push to `main` to deploy.

### Local Preview

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Project Structure

- `/index.html`: root redirect to English (`/en/`)
- `/en`, `/ko`: localized pages (Home, Members, Research, Publications, Contact)
- `/assets/css/main.css`: global styles and responsive layout
- `/assets/js/site.js`: navigation and language switch logic
- `/assets/js/data-loader.js`: members/publications data loading and rendering
- `/data/members.json`: member data
- `/data/publications.json`: publication data
- `/.github/workflows/pages.yml`: GitHub Pages deployment workflow
- `/CONTENT_GUIDE.md`: content update guide

## Data Contracts

### `data/members.json`

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
  "photo": "/assets/img/members/bae-jaehyeong.jpg",
  "startYear": 2023,
  "endYear": null
}
```

### `data/publications.json`

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

## Deployment (GitHub Pages)

1. Go to repository **Settings > Pages**.
2. Set source to **GitHub Actions**.
3. Push to `main`.
4. Confirm workflow success in **Actions**.
