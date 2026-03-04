# Content Update Guide (Obsidian Friendly)

This project is designed so you can edit site text directly in Obsidian.

## 1) Open Obsidian Vault

Open this folder as your vault:

- `/Users/bnc/Desktop/codex_project/codex_github_homepage/content`

Edit files in:

- `content/en/*.md`
- `content/ko/*.md`

## 2) Edit in Markdown Body (No YAML Required)

Each file uses simple section headings:

```md
## title
Your title

## description
Your paragraph text

## items
- 2026.01 | Title | Body
```

Common list formats:

- Navigation: `- slug | label`
- Home news: `- date | text`
- Research cards: `- title | body`
- News page items: `- date | title | body`
- Contact labels: `- key | label`

## 3) Publish in One Command

From terminal at project root, run:

```bash
npm run publish -m "Update homepage content"
```

What it does automatically:

1. Generate app JSON from Markdown (`npm run content:build`)
2. Stage content files and generated JSON
3. Commit with your message
4. Push to `origin/main`

If you only want to test generation without commit/push:

```bash
npm run publish:dry
```

## 4) Members/Publications Data

These remain JSON data files (not page text):

- `public/data/members.json`
- `public/data/publications.json`

## 5) Verify

```bash
npm run build
```

Check `/en`, `/ko`, `news`, and bottom contact section render correctly.
