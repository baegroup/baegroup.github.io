import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLICATIONS_PATH = path.join(ROOT, 'public', 'data', 'publications.json');

function normalizeTitle(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function toWordSet(value) {
  return new Set(
    normalizeTitle(value)
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length > 1)
  );
}

function jaccardSimilarity(a, b) {
  if (!a.size || !b.size) {
    return 0;
  }
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
}

function readCrossrefYear(item) {
  const candidates = [
    item?.published?.['date-parts']?.[0]?.[0],
    item?.['published-print']?.['date-parts']?.[0]?.[0],
    item?.['published-online']?.['date-parts']?.[0]?.[0],
    item?.issued?.['date-parts']?.[0]?.[0]
  ];
  for (const value of candidates) {
    const year = Number(value);
    if (Number.isFinite(year) && year > 1900) {
      return year;
    }
  }
  return null;
}

function toFullAuthorName(author) {
  const given = String(author?.given || '').trim();
  const family = String(author?.family || '').trim();
  return `${given} ${family}`.trim();
}

function hasInitialsOnly(authors) {
  return (Array.isArray(authors) ? authors : []).some((author) => /(^|[\s,])[A-Z]\./.test(String(author || '')));
}

function extractMarker(authorName) {
  const match = String(authorName || '').match(/([*†]+)\s*$/);
  return match ? match[1] : '';
}

function withMarker(fullName, marker) {
  const base = String(fullName || '').trim();
  return marker ? `${base}${marker}` : base;
}

function scoreCandidate(pub, item) {
  const sourceTitle = pub?.title;
  const targetTitle = item?.title?.[0] || '';
  const sourceSet = toWordSet(sourceTitle);
  const targetSet = toWordSet(targetTitle);
  const titleScore = jaccardSimilarity(sourceSet, targetSet);

  const pubYear = Number(pub?.year) || null;
  const itemYear = readCrossrefYear(item);
  const yearScore = pubYear && itemYear && pubYear === itemYear ? 0.2 : 0;

  const sourceJournal = normalizeTitle(pub?.journal);
  const targetJournal = normalizeTitle(item?.['container-title']?.[0] || '');
  const journalScore = sourceJournal && targetJournal && (sourceJournal.includes(targetJournal) || targetJournal.includes(sourceJournal)) ? 0.1 : 0;

  return titleScore + yearScore + journalScore;
}

async function queryCrossref(pub) {
  const query = encodeURIComponent(`${pub.title} ${pub.journal || ''} ${pub.year || ''}`.trim());
  const url = `https://api.crossref.org/works?query.bibliographic=${query}&rows=8`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'BaeLabWebsiteBot/1.0 (mailto:jbae@khu.ac.kr)'
    }
  });

  if (!response.ok) {
    throw new Error(`Crossref request failed (${response.status})`);
  }

  const data = await response.json();
  const items = Array.isArray(data?.message?.items) ? data.message.items : [];
  if (!items.length) {
    return null;
  }

  const scored = items
    .map((item) => ({ item, score: scoreCandidate(pub, item) }))
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top || top.score < 0.55) {
    return null;
  }
  return top.item;
}

function toPublicationsRecord(pub, crossrefItem) {
  const doi = String(crossrefItem?.DOI || '').trim();
  const journalFromCrossref = String(crossrefItem?.['container-title']?.[0] || '').trim();
  const volumeFromCrossref = String(crossrefItem?.volume || '').trim();
  const issueFromCrossref = String(crossrefItem?.issue || '').trim();
  const pagesFromCrossref = String(crossrefItem?.page || '').trim();
  const crossrefAuthors = Array.isArray(crossrefItem?.author)
    ? crossrefItem.author.map((author) => toFullAuthorName(author)).filter(Boolean)
    : [];

  let authors = pub.authors;
  if (crossrefAuthors.length && (hasInitialsOnly(pub.authors) || !Array.isArray(pub.authors) || !pub.authors.length)) {
    const markers = (Array.isArray(pub.authors) ? pub.authors : []).map((name) => extractMarker(name));
    authors = crossrefAuthors.map((name, index) => withMarker(name, markers[index] || ''));
  }

  return {
    ...pub,
    authors,
    journal: pub.journal || journalFromCrossref,
    volume: pub.volume || volumeFromCrossref,
    issue: pub.issue || issueFromCrossref,
    pages: pub.pages || pagesFromCrossref,
    doi: pub.doi || doi,
    link: pub.link || (doi ? `https://doi.org/${doi}` : pub.link)
  };
}

function upsertPatent(publications) {
  const patentId = '2025-ep3907876b1-mxene-complex-generator';
  const exists = publications.some((item) => item.id === patentId);
  if (exists) {
    return publications;
  }

  const patent = {
    id: patentId,
    year: 2025,
    type: 'patent',
    title: 'MXene-coated hydrophilic fiber membrane-based complex generator and manufacturing method thereof',
    authors: ['Il-Doo Kim', 'Jaehyeong Bae', 'Min Soo Kim'],
    journal: 'European Patent EP3907876B1',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    link: 'https://patents.google.com/patent/EP3907876B1/en',
    coverImage: ''
  };

  return [...publications, patent];
}

async function main() {
  const raw = await fs.readFile(PUBLICATIONS_PATH, 'utf8');
  const publications = JSON.parse(raw);

  let updatedCount = 0;
  for (let index = 0; index < publications.length; index += 1) {
    const pub = publications[index];
    if (pub.type !== 'journal') {
      continue;
    }

    const missingCore = !String(pub.doi || '').trim() || !String(pub.volume || '').trim() || !String(pub.pages || '').trim();
    if (!missingCore) {
      continue;
    }

    try {
      const candidate = await queryCrossref(pub);
      if (!candidate) {
        continue;
      }
      const next = toPublicationsRecord(pub, candidate);
      const changed = JSON.stringify(next) !== JSON.stringify(pub);
      if (changed) {
        publications[index] = next;
        updatedCount += 1;
      }
      await new Promise((resolve) => setTimeout(resolve, 160));
    } catch (error) {
      console.warn(`[warn] ${pub.id}: ${error.message}`);
    }
  }

  const withPatent = upsertPatent(publications).sort((a, b) => {
    const yearDelta = (b.year || 0) - (a.year || 0);
    if (yearDelta !== 0) {
      return yearDelta;
    }
    return String(a.title || '').localeCompare(String(b.title || ''));
  });

  await fs.writeFile(PUBLICATIONS_PATH, `${JSON.stringify(withPatent, null, 2)}\n`, 'utf8');

  const typeCount = withPatent.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  console.log(`Publication metadata updated from Crossref: ${updatedCount}`);
  console.log(`Publication counts by type: ${JSON.stringify(typeCount)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
