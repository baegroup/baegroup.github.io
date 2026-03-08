# Notion News Setup

This setup lets a PI/lab manager update the News page from Notion without editing code.

## 1) Create Notion Database

Create one database with these properties:

- `Title` (Title)
- `Section` (Select): `Lab News`, `Gallery`, `Videos`
- `Date` (Date)
- `Summary` (Text)
- `Link` (URL, optional)
- `Video` (URL, optional)
- `Images` (Files & media, optional, multi-upload)
- `Published` (Checkbox, optional)

## 2) Share DB with Integration

- Create a Notion internal integration and copy token.
- Share the database with that integration.
- Copy database ID.

## 3) Environment Variables

```bash
export NOTION_TOKEN="secret_xxx"
export NOTION_NEWS_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Optional Instagram sync (Graph API):

```bash
export INSTAGRAM_ACCESS_TOKEN="IGQV..."
export INSTAGRAM_USER_ID="1784..."
export INSTAGRAM_HANDLE="@baelab.khu"
export INSTAGRAM_PROFILE_URL="https://www.instagram.com/baelab.khu/"
```

Optional PI links:

```bash
export PI_LINKEDIN_URL="https://www.linkedin.com/in/..."
export PI_WOS_URL="https://www.webofscience.com/wos/author/record/..."
export PI_ORCID_URL="https://orcid.org/..."
export PI_SCOPUS_URL="https://www.scopus.com/authid/detail.uri?authorId=..."
export PI_SCHOLAR_URL="https://scholar.google.com/citations?user=..."
export PI_RESEARCHGATE_URL="https://www.researchgate.net/profile/..."
```

## 4) Sync

```bash
npm run news:sync:notion
```

Output:

- `public/data/news.json`
- downloaded images in `public/assets/img/news/notion`
- downloaded instagram thumbnails in `public/assets/img/news/instagram` (if Instagram env is set)

## 5) Image Workflow Recommendation

Most PI-friendly flow:

1. Upload photos directly into Notion `Images` property.
2. Run `npm run news:sync:notion`.
3. Commit and deploy.

Why this is recommended:

- No manual filename management required.
- Script downloads and stores files locally, so published URLs stay stable.

