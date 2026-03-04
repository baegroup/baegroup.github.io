# Content Update Guide

This guide explains how to update Bae Lab content without changing React page code.

## 1) Update Members

Edit:

- `public/data/members.json`

Required fields per member:

- `id`: unique identifier (`kebab-case`)
- `name.en`, `name.ko`: English/Korean names
- `role`: `PI`, `Researcher`, `Graduate`, `Undergraduate`, `Alumni`
- `status`: `current` or `alumni`
- `program`: `PhD`, `MSPhD`, `MS`, `BS`, `Staff`
- `startYear`: year joined

Optional fields:

- `email`, `website`, `interests.en`, `interests.ko`, `photo`, `endYear`

Photo policy:

- If `photo` is missing or broken, initials avatar is shown automatically.
- Recommended path format: `/assets/img/members/<file-name>.jpg`

## 2) Update Publications

Edit:

- `public/data/publications.json`

Required fields per publication:

- `id`: unique identifier
- `year`: publication year (number)
- `type`: `conference`, `journal`, `preprint`, `patent`
- `title.en`, `title.ko`
- `authors`: author array in citation order
- `venue`

Optional fields:

- `doi`, `url`, `labAuthors`, `featured`

Display behavior:

- Publications are sorted by year descending.
- IEEE-style citation string is generated automatically.
- Type filters are available in both language pages.

## 3) Local Check Before Push

1. Install dependencies:

```bash
npm install
```

2. Run local server:

```bash
npm run dev
```

3. Confirm:

- `/` redirects to `/en`
- language switch works (`/en` <-> `/ko`)
- members and publications render correctly
- mobile nav menu opens/closes correctly

## 4) Deploy

1. Commit and push to `main`
2. Confirm GitHub Action `Deploy GitHub Pages` passes
3. Verify production URL and data rendering
