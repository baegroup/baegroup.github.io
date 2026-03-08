# Notion CMS Setup (News + Team + Publications)

This website can be operated from Notion by syncing three databases into local JSON:

- `News` -> `public/data/news.json`
- `Team` -> `public/data/team.json`
- `Publications` -> `public/data/publications.json`

## 1) Required Environment Variables

```bash
export NOTION_TOKEN="ntn_xxx"
export NOTION_NEWS_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_TEAM_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PUBLICATIONS_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Optional data source IDs (for databases with multiple data sources):

```bash
export NOTION_NEWS_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_TEAM_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PUBLICATIONS_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Optional social links:

```bash
export PI_LINKEDIN_URL="https://www.linkedin.com/in/..."
export PI_WOS_URL="https://www.webofscience.com/wos/author/record/..."
export PI_ORCID_URL="https://orcid.org/..."
export PI_SCOPUS_URL="https://www.scopus.com/authid/detail.uri?authorId=..."
export PI_SCHOLAR_URL="https://scholar.google.com/citations?user=..."
export PI_RESEARCHGATE_URL="https://www.researchgate.net/profile/..."
```

Optional Instagram Graph API (for automatic latest feed download):

```bash
export INSTAGRAM_ACCESS_TOKEN="IGQV..."
export INSTAGRAM_USER_ID="1784..."
export INSTAGRAM_HANDLE="@baelab.khu"
export INSTAGRAM_PROFILE_URL="https://www.instagram.com/baelab.khu/"
```

## 2) Sync Commands

```bash
npm run notion:push:site-data
npm run news:sync:notion
npm run team:sync:notion
npm run publications:sync:notion
```

`notion:push:site-data` uploads current local Team/Publications JSON into Notion (bootstrap/update step).

Run all at once:

```bash
npm run cms:sync:notion
```

## 3) Database Schema: News

| Property | Type | Required | Notes |
|---|---|---:|---|
| Title | Title | Yes | Item title |
| Section | Select | Yes | `Lab News` / `Gallery` / `Videos` |
| Date | Date | Yes | Sorting uses latest first |
| Summary | Rich text | No | First paragraph shown when expanded |
| Link | URL | No | External source |
| Video | URL | No | YouTube/Video link |
| Images | Files & media | No | Multiple files allowed |
| Published | Checkbox | No | Unchecked items are hidden |

## 4) Database Schema: Team

| Property | Type | Required | Notes |
|---|---|---:|---|
| Published | Checkbox | No | Recommended as first visible column after Name |
| Name | Title | Yes | Member display name |
| ID | Rich text | No | Slug-like ID; auto-generated from name if empty |
| Role | Select | Yes | `PI` / `Researcher` / `Graduate` / `Undergraduate` / `Alumni` |
| Program | Select | No | `PhD` / `MSPhD` / `MS` / `BS` / `Staff` |
| E-mail | Rich text | No | Member email |
| Photo | Files & media | No | First file is used as profile photo |
| Start Year | Number | No | For ordering |
| End Year | Number | No | Alumni ordering support |
| Start Year & Semester | Rich text | No | e.g., `2024 Fall` |
| Undergraduate School | Rich text | No |  |
| Undergraduate Major | Rich text | No |  |
| Master School | Rich text | No |  |
| Master Major | Rich text | No |  |
| Research Interests | Rich text | No | Comma/line-separated |
| Korean Proficiency | Rich text | No | e.g., TOPIK |
| Current Affiliation | Rich text | No | Mainly for alumni |
| Note | Rich text | No | Extra remarks |

## 5) Database Schema: Publications

| Property | Type | Required | Notes |
|---|---|---:|---|
| Title | Title | Yes | Paper title |
| ID | Rich text | No | Slug-like ID; auto-generated if empty |
| Year | Number | Yes | Publication year |
| Type | Select | Yes | `journal` / `patent` (supports `preprint`, `conference`) |
| Authors | Rich text | Yes | Use `;` or newline between authors |
| Venue | Rich text | Yes | Journal or patent venue |
| DOI | Rich text | No | Raw DOI or `https://doi.org/...` (normalized automatically) |
| URL | URL | No | Paper link |
| Lab Authors | Multi-select or Rich text | No | Names used for underline highlighting |
| Lab Author IDs | Rich text | No | Optional IDs (comma-separated) |
| Featured | Checkbox | No | Optional sort boost |
| Cover | Files & media | No | Journal cover image (first file used) |
| Published | Checkbox | No | Unchecked items are hidden |

## 6) Recommended Editing Rule

- Team and Publications should always be edited in Notion first.
- Run `npm run cms:sync:notion` after edits.
- Review JSON diff, then commit/push.
