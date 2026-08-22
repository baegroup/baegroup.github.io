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

## Health Checks

```bash
npm run check
npm run audit:live
```

GitHub Actions also validates the repository, creates a full production build,
and audits every canonical URL on the public site each Monday at 09:15 KST.

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
- Instagram: `npm run instagram:sync`
- Team: `npm run team:sync:notion`
- Papers, patents, and conference presentations: `npm run publications:sync:notion`
- Bootstrap Team/Papers/Patents/Conference Presentations from local JSON into Notion: `npm run notion:push:site-data`
- Create or repair the three publication databases: `npm run notion:setup:publication-dbs`
- All at once: `npm run cms:sync:notion`
- Analytics dashboard: `npm run analytics:sync:notion` (daily GitHub Action; requires `GA4_SERVICE_ACCOUNT_JSON`)

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

News `Summary` values entered in Notion are published automatically to the
expanded news row, detail page, search metadata, and RSS. Notion news images
are converted to WebP during synchronization. Existing news images can be
optimized with `npm run images:optimize:news`.

## Instagram feed automation

The News sidebar mirrors the latest posts from the official Bae Lab Instagram
account. The scheduled `Instagram Sync` workflow runs every six hours and saves
post media locally as optimized WebP files so the website does not depend on
expiring Instagram CDN URLs.

The Instagram account must be a Professional account (Business or Creator).
Configure a Meta app using Instagram API with Instagram Login and grant
`instagram_business_basic`, then add these repository secrets:

- `INSTAGRAM_ACCESS_TOKEN`: Instagram User access token
- `INSTAGRAM_USER_ID`: Instagram-scoped professional account ID

Optional local variables are `INSTAGRAM_API_VERSION`, `INSTAGRAM_POST_LIMIT`,
`INSTAGRAM_HANDLE`, and `INSTAGRAM_PROFILE_URL`. Carousel posts are downloaded
and displayed with their original image order, caption, timestamp, and
permalink.
