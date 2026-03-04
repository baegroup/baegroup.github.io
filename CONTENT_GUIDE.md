# Content Update Guide (Obsidian Friendly)

This project separates content editing from React code.

## 1) Edit Site Text in Obsidian

Use these folders as your content source:

- `content/en/*.md`
- `content/ko/*.md`

Recommended files to edit:

- `home.md`: hero text, home cards, home news summary
- `news.md`: news page items
- `research.md`: research cards and methods
- `members.md`: members page labels (not member list data)
- `publications.md`: publications page labels (not publication list data)
- `contact.md`: global bottom contact section labels/text
- `brand.md`: lab title/subtitle in header/footer
- `navigation.md`: top menu labels

## 2) Generate App Content

After editing Markdown, run:

```bash
npm run content:build
```

This updates:

- `src/content/site-content.generated.json`

Notes:

- `npm run dev` automatically runs content generation once at startup.
- If dev server is already running, rerun `npm run content:build` and refresh.

## 3) Update Members and Publications Data

These are separate from page text:

- `public/data/members.json`
- `public/data/publications.json`

### Members required fields

- `id`, `name.en`, `name.ko`, `role`, `status`, `program`, `startYear`

### Publications required fields

- `id`, `year`, `type`, `title.en`, `title.ko`, `authors`, `venue`

## 4) Local Verification

```bash
npm run build
```

Check:

- `/` redirects to `/en`
- language switch works (`/en` <-> `/ko`)
- news page and bottom contact section render correctly
- members/publications data render correctly

## 5) Deploy

1. Commit and push to `main`
2. Confirm GitHub Action `Deploy GitHub Pages` passes
3. Verify production URL
