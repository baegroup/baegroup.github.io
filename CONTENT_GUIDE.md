# Content Update Guide

This guide explains how to update lab members and publications without changing page code.

## 1) Update Members

Edit:

- `data/members.json`

Required fields per member:

- `id`: unique identifier (`kebab-case`)
- `name.en`, `name.ko`: English/Korean names
- `role`: `PI`, `Researcher`, `Graduate`, `Undergraduate`, `Alumni`
- `status`: `current` or `alumni`
- `program`: `PhD`, `MS`, `BS`, `Staff`
- `startYear`: year joined

Optional fields:

- `email`, `website`, `interests.en`, `interests.ko`, `photo`, `endYear`

Photo policy:

- If `photo` is missing or invalid, initials avatar is shown automatically.
- Preferred photo path format: `/assets/img/members/<file-name>.jpg`

## 2) Update Publications

Edit:

- `data/publications.json`

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

- Publications are sorted by year (descending).
- IEEE-style citation string is generated automatically.
- Type filters are available in both language pages.

## 3) Bilingual Content Rules

- Always fill both `en` and `ko` fields.
- If one language is missing, UI falls back to English.
- Keep terminology consistent across languages (lab terminology list recommended).

## 4) Local Check Before Push

1. Run a local static server:

```bash
python3 -m http.server 8000
```

2. Open `http://localhost:8000`.
3. Confirm:

- `/` redirects to `/en/`
- language switch works (`/en` <-> `/ko`)
- Members and Publications render correctly
- mobile menu works on narrow width

## 5) Deploy

1. Commit and push changes to `main`.
2. Open GitHub **Actions** and confirm `Deploy GitHub Pages` succeeds.
3. Open the Pages URL and verify no missing styles, scripts, or data.
