# Content & Data Guide

## 1) Static Page Copy

Edit markdown files:

- `content/en/home.md`
- `content/en/team.md`
- `content/en/research.md`
- `content/en/publications.md`
- `content/en/news.md`
- `content/en/join.md`
- `content/en/contact.md`
- `content/en/navigation.md`

Generate content JSON:

```bash
npm run content:build
```

Generated file:

- `src/content/site-content.generated.json`

## 2) Dynamic Lab Data (Notion-first)

The following are intended to be managed in Notion and synced:

- News -> `public/data/news.json`
- Team -> `public/data/team.json`
- Publications -> `public/data/publications.json`

Sync commands:

```bash
npm run notion:push:site-data
npm run news:sync:notion
npm run team:sync:notion
npm run publications:sync:notion
npm run cms:sync:notion
```

DB schema and environment variables:

- `NOTION_CMS_SETUP.md`

## 3) Funding Logo Upload Rule

Funding logo files should be placed in:

- `public/assets/img/research/funding`

Supported extensions:

- `.webp`, `.png`, `.jpg`, `.jpeg`

The loader tries these base names in order:

1. `logo` value in `content/en/research.md` (`fundingItems`)
2. Funding title text (exact file name)
3. Normalized funding title text
4. Slugified funding title

## 4) Home Research Copy

Home research card copy is managed separately from Research page body:

- `src/content/home-research-copy.js`

## 5) Publish

```bash
npm run publish -m "Update content"
npm run publish:cms
```
