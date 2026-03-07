# Obsidian Template Notes

These notes are reusable templates for editing site content in Obsidian.

## Folder

- `content/_templates/en/*.md`
- `content/_templates/ko/*.md`

## How to use

1. Copy a template note into the real content folder.
2. Replace text.
3. Run publish command.

Example:

```bash
cp content/_templates/ko/news.md content/ko/news.md
npm run publish -m "Update news content"
```

## Notes

- The content parser reads section headings like `## title`, `## items`.
- For list sections, keep `- value` or `- left | right` format.
