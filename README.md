# Bae Lab Website

English-only website for Bae Lab.

## Stack

- React 18 + React Router
- Vite
- Tailwind CSS
- Markdown content build pipeline (`content/en/*.md` -> `src/content/site-content.generated.json`)
- JSON data sources (`public/data/*.json`)
- Optional Notion CMS sync for News/Team/Publications

## Local Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Content/Data Update Flows

### A) Page copy (static text)

Edit:

- `content/en/*.md`

Generate:

```bash
npm run content:build
```

### B) Dynamic data (recommended: Notion)

- News: `npm run news:sync:notion`
- Team: `npm run team:sync:notion`
- Publications: `npm run publications:sync:notion`
- Bootstrap Team/Publications from local JSON into Notion: `npm run notion:push:site-data`
- All at once: `npm run cms:sync:notion`

Detailed setup and DB schema:

- `NOTION_CMS_SETUP.md`

### C) Publish helper

```bash
npm run publish -m "Update site content"
npm run publish:cms
```

## Data Files

- `public/data/news.json`
- `public/data/team.json`
- `public/data/publications.json`

## Media Paths

- Home: `public/assets/img/home/*`
- Team: `public/assets/img/team/*`
- Research area images: `public/assets/img/research/areas/*`
- Research funding logos: `public/assets/img/research/funding/*`
- News sync assets: `public/assets/img/news/notion/*`
- Publication covers: `public/assets/img/publications/covers/*`
