# Publication Cover Images

Put journal cover files in this folder:

- `public/assets/img/publications/covers/`

Recommended file naming:

- `journal_name_YYYY_MM.webp`
- `journal_name_YYYY_MM.png`
- `journal_name_YYYY_MM.jpg`
- `journal_name_YYYY_MM.jpeg`

Example:

- `advanced_energy_materials_2025_07.png`

How it works:

1. `npm run content:build` scans this folder.
2. It generates `public/data/publication-covers.json`.
3. Publications page reads that JSON and shows:
   - Journal name (from file name)
   - Year/month (from `YYYY_MM`)
   - Cover image

Notes:

- If multiple formats exist for the same base name, priority is `webp > png > jpg > jpeg`.
- Old id-based names (`<publication.id>.*`) still work as fallback, but `journal_name_YYYY_MM` is preferred.
