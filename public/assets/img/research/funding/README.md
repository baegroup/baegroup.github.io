# Research Funding Logos

Funding logos are read by base name and auto-detect extension in this order:

- `.webp`
- `.png`
- `.jpg`
- `.jpeg`

The loader checks multiple base-name candidates in order:

1. `logo` value in `content/en/research.md` (`fundingItems`)
2. Funding title text itself (exact file name)
3. Funding title text (normalized punctuation)
4. Slugified funding title

Path pattern used by the page:

- `public/assets/img/research/funding/<base-name>.<ext>`

This means you can upload files directly using the funding title as the file name.
