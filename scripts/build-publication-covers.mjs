import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COVERS_DIR = path.join(ROOT, 'public', 'assets', 'img', 'publications', 'covers');
const OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'publication-covers.json');
const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];

function toTitleCase(value) {
  const lowerWords = new Set(['and', 'or', 'of', 'for', 'in', 'on', 'to', 'the', 'a', 'an']);
  const tokens = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return tokens
    .map((token, index) => {
      if (/^[A-Z0-9&+.-]{2,}$/.test(token)) {
        return token;
      }
      const lower = token.toLowerCase();
      if (index > 0 && lowerWords.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function normalizeJournalSlug(raw) {
  return String(raw || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function parseCoverBaseName(baseName) {
  const match = String(baseName || '').match(/^(.*)_(\d{4})_(\d{1,2})$/);
  if (!match) {
    const fallbackJournal = toTitleCase(normalizeJournalSlug(baseName));
    return {
      journal: fallbackJournal,
      year: null,
      month: null,
      sortDate: 0
    };
  }

  const journalRaw = normalizeJournalSlug(match[1]);
  const year = Number(match[2]);
  const month = Math.min(12, Math.max(1, Number(match[3])));

  return {
    journal: toTitleCase(journalRaw),
    year,
    month,
    sortDate: year * 100 + month
  };
}

function compareByExtensionPriority(a, b) {
  const aIdx = IMAGE_EXTENSIONS.indexOf(a.ext);
  const bIdx = IMAGE_EXTENSIONS.indexOf(b.ext);
  return aIdx - bIdx;
}

async function main() {
  let dirEntries = [];
  try {
    dirEntries = await fs.readdir(COVERS_DIR, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
      await fs.writeFile(OUTPUT_PATH, '[]\n', 'utf8');
      console.log(`Generated covers manifest: ${path.relative(ROOT, OUTPUT_PATH)} (0 records)`);
      return;
    }
    throw error;
  }

  const grouped = new Map();

  dirEntries.forEach((entry) => {
    if (!entry.isFile()) {
      return;
    }

    const parsed = path.parse(entry.name);
    const ext = parsed.ext.replace('.', '').toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      return;
    }

    const base = parsed.name;
    const bucket = grouped.get(base) || [];
    bucket.push({
      base,
      ext,
      fileName: entry.name
    });
    grouped.set(base, bucket);
  });

  const records = [...grouped.values()]
    .map((bucket) => {
      const selected = [...bucket].sort(compareByExtensionPriority)[0];
      const parsed = parseCoverBaseName(selected.base);
      return {
        id: selected.base.toLowerCase(),
        baseName: selected.base,
        fileName: selected.fileName,
        path: `assets/img/publications/covers/${selected.fileName}`,
        journal: parsed.journal,
        year: parsed.year,
        month: parsed.month,
        sortDate: parsed.sortDate
      };
    })
    .sort((a, b) => {
      const sortDelta = (b.sortDate || 0) - (a.sortDate || 0);
      if (sortDelta !== 0) {
        return sortDelta;
      }
      const yearDelta = (b.year || 0) - (a.year || 0);
      if (yearDelta !== 0) {
        return yearDelta;
      }
      return String(a.journal || '').localeCompare(String(b.journal || ''));
    });

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  console.log(`Generated covers manifest: ${path.relative(ROOT, OUTPUT_PATH)} (${records.length} records)`);
}

main().catch((error) => {
  console.error('[build-publication-covers] Failed to generate covers manifest.');
  console.error(error);
  process.exit(1);
});
