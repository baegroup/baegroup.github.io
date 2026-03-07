# Content Update Guide (Obsidian Friendly)

This project is designed so you can edit site text directly in Obsidian.

## 1) Open Obsidian Vault

Open this folder as your vault:

- `/Users/bnc/Desktop/codex_project/codex_github_homepage/content`

Edit files in:

- `content/en/*.md`

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

## 3) Use Template Notes (Optional)

Template notes are available here:

- `content/_templates/en/*.md`

Example:

```bash
cp content/_templates/en/news.md content/en/news.md
```

Then edit in Obsidian and publish.

## 4) Publish in One Command

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

## 5) Team/Publications Data

These remain JSON data files (not page text):

- `public/data/team.json`
- `public/data/publications.json`

## 6) Homepage Image Update (Fixed Filenames)

Replace image files below to update the homepage sections:

- Hero background: `public/assets/img/home/hero/cover.[jpg|jpeg|png|webp]`
- Research cards: `public/assets/img/home/research/area-1.[jpg|jpeg|png|webp]`, `area-2.*`, `area-3.*`
- Featured news image: `public/assets/img/home/news/featured.[jpg|jpeg|png|webp]`
- Join section image: `public/assets/img/home/join/team.[jpg|jpeg|png|webp]`

Recommended image sizes:

- Hero: 2400x1200 (or wider, 2:1 ratio)
- Research cards: 1600x1000 each
- Featured news: 1600x1000
- Join: 1800x1125 (16:10 ratio)

Keep base filenames unchanged (`cover`, `area-1`, `area-2`, `area-3`, `featured`, `team`). Extension can be jpg/jpeg/png/webp.

## 7) Home News Rule

Homepage news renders as:

- 1 featured card (latest item in `content/en/news.md`)
- 5 compact rows (next five latest items)

Add at least 6 items in `news.md` to fully populate the section.

## 8) Home Motion (Accessibility)

Homepage sections use subtle reveal motion on scroll.

- Motion runs each time a section re-enters the viewport.
- If OS setting `Reduce Motion` is enabled, animations are disabled automatically.

## 9) Verify

```bash
npm run build
```

Check `/`, `news`, and bottom contact section render correctly.
