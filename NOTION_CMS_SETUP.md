# Notion CMS Setup (News + Team + Research Outputs)

This website can be operated from Notion by syncing five databases into local JSON:

- `News` -> `public/data/news.json`
- `Team` -> `public/data/team.json`
- `Papers` + `Patents` + `Conference Presentations` -> `public/data/publications.json`

## Aerolith3d connection

The migrated CMS lives under **Private → Bae Lab 홈페이지 관리 → Website CMS** in the
Aerolith3d workspace, separately from Aerolith business documents.

- CMS: https://app.notion.com/p/03cf35662a74826ab8a101df9f41fe55
- Analytics: https://app.notion.com/p/5faf35662a7482bc9384015c67872049
- Both GitHub Actions workflows use the repository secret `NOTION_AEROLITH_TOKEN`,
  exposed to the scripts as `NOTION_TOKEN`. The original `NOTION_TOKEN` secret is
  retained for rollback and is not a fallback for the migrated databases.
- Grant the API connection access to the copied **Website CMS** page and its
  descendants, with read/update/insert content capabilities. It does not need
  access to the other Aerolith business pages.
- Database and data source IDs are pinned in `notion-daily-sync.yml`; the News
  database also contains an empty data source, so its data source ID is required.
- `NOTION_ANALYTICS_PAGE_ID` pins the copied dashboard. The analytics script checks
  that it belongs to the same CMS page as News before updating its content.
- `scripts/lib/notion-news-page-ids.mjs` preserves the original public identity of
  all 43 copied news items, keeping existing URLs, corrections, and image filenames.

Before deploying a connection change, run **Daily Notion Sync** on the change branch
with `dry_run` enabled. This fetches content and validates assets without publishing.
After merging, run the normal sync and analytics workflows and verify the Pages deployment.

## Publish from Notion

The **홈페이지 반영** button at the top of the Bae Lab management page sets
`요청 시간` to the time the button is clicked in the single-row **홈페이지 반영 현황** database.
`Daily Notion Sync` checks for unclaimed requests every five minutes and retains its
daily 00:30 KST full sync. GitHub schedules may be delayed; the button is a queued
request, not an immediate webhook. No GitHub credential is stored in Notion.

The visible `진행 상태` formula reports pending requests immediately. The workflow
claims the observed timestamp, then records syncing, deployment queued, deploying,
and completion/failure. A request made while another run is working remains pending
for the next run. Only a successful Pages deployment updates `마지막 반영 시간` and
`반영 커밋`; failures retain the previous success time. `실행 기록` links to the run.
Even unchanged content is deployed when requested so completion refers to a real
successful deployment. Branch runs and `dry_run` do not claim requests or deploy.

Status page: `420f3566-2a74-814c-8918-dce8210364f2`.
Status data source: `420f3566-2a74-812c-a474-000b9d15b3f6`.
The existing `Bae Lab Website Sync` integration inherits access from the management page.

If status is `실패`, inspect the linked run, fix the error, and click the button again.
If it remains pending, check that Actions schedules are enabled (GitHub may disable
scheduled workflows in a public repository after 60 days without repository activity).
The Actions `Run workflow` option remains available for immediate manual execution.

## 1) Required Environment Variables

```bash
export NOTION_TOKEN="ntn_xxx"
export NOTION_NEWS_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_TEAM_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PUBLICATIONS_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PATENTS_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PRESENTATIONS_DB_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Optional data source IDs (for databases with multiple data sources):

```bash
export NOTION_NEWS_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_TEAM_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PUBLICATIONS_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PATENTS_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_PRESENTATIONS_DATA_SOURCE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Optional social links:

```bash
export PI_LINKEDIN_URL="https://www.linkedin.com/in/..."
export PI_WOS_URL="https://www.webofscience.com/wos/author/record/GVR-7870-2022"
export PI_ORCID_URL="https://orcid.org/..."
export PI_SCOPUS_URL="https://www.scopus.com/authid/detail.uri?authorId=57211514022"
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

`notion:push:site-data` uploads current local Team/Papers/Patents/Conference Presentations JSON into Notion (bootstrap/update step).

Run all at once:

```bash
npm run cms:sync:notion
```

## 3) Database Schema: News

| Property | Type | Required | Notes |
|---|---|---:|---|
| Title | Title | Yes | Item title |
| Section | Select | Yes | `Highlights` / `Lab Life` / `Video` (same labels as the website) |
| Date | Date | Yes | Sorting uses latest first |
| Summary | Rich text | No | Automatically shown in expanded rows and detail pages, and reused for search metadata and RSS |
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

## 5) Database Schema: Papers

| Property | Type | Required | Notes |
|---|---|---:|---|
| Published | Checkbox | No | Unchecked items are hidden |
| Title | Title | Yes | Paper title |
| ID | Rich text | No | Slug-like ID; auto-generated if empty |
| Year | Number | Yes | Publication year |
| Type | Select | Yes | `journal` / `preprint` |
| Authors | Rich text | Yes | Use `;` or newline between authors |
| Journal | Rich text | Yes | Journal name |
| Volume | Rich text | No | Journal volume |
| Issue | Rich text | No | Journal issue |
| Pages | Rich text | No | Page range / article number |
| DOI | URL | No | Single link field (DOI URL or external paper link) |
| Cover | Files & media | No | Journal cover image (first file used) |

## 6) Database Schema: Patents

| Property | Type | Required | Notes |
|---|---|---:|---|
| Published | Checkbox | No | Unchecked items are hidden |
| Title | Title | Yes | Patent title |
| ID | Rich text | No | Stable slug-like ID |
| Year | Number | No | Temporary grouping fallback until Filing Date is complete |
| Jurisdiction | Select | Yes | e.g., `United States`, `European Patent Office` |
| Stage | Select | Yes | `Application` / `Granted` |
| Legal Status | Select | No | `Pending` / `Active` / `Abandoned` / `Expired` |
| Application Number | Rich text | No | Application number |
| Grant/Publication Number | Rich text | No | Grant or publication number |
| Inventors | Rich text | Yes | Use `;` or newline between inventors |
| Filing Date | Date | No | Used for the final year grouping once entered |
| URL | URL | No | Public patent record |

## 7) Database Schema: Conference Presentations

| Property | Type | Required | Notes |
|---|---|---:|---|
| Published | Checkbox | No | Unchecked items are hidden |
| Title | Title | Yes | Presentation title |
| ID | Rich text | No | Stable slug-like ID |
| Conference | Rich text | Yes | Full conference name |
| Date | Date | Yes | Use a date range for multi-day conferences |
| Presentation Type | Select | Yes | `Poster` / `Oral` / `Invited Talk` |
| Presenters | Multi-select | Yes | Names shown in bold |
| Authors | Rich text | Yes | Use `;` or newline between authors |
| Corresponding Authors | Multi-select | No | Matching names receive `*` automatically |
| City | Rich text | Yes | Displayed on the website |
| Country | Select | Yes | Displayed on the website |
| Award | Rich text | No | Displayed only when present |
| Note | Rich text | No | Internal note; not shown publicly |

## 8) Recommended Editing Rule

- Team, Papers, Patents, and Conference Presentations should always be edited in Notion first.
- For News, write a concise one- or two-sentence `Summary`; the next daily sync publishes it automatically.
- News images are resized to a maximum of 1920 px and converted to WebP during sync.
- Run `npm run cms:sync:notion` after edits.
- Review JSON diff, then commit/push.
