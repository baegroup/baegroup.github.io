const ROLE_ORDER = ['PI', 'Researcher', 'Graduate', 'Undergraduate', 'Alumni'];

const ROLE_LABELS = {
  PI: 'Principal Investigator',
  Researcher: 'Researchers',
  Graduate: 'Graduate Students',
  Undergraduate: 'Undergraduate Students',
  Alumni: 'Alumni'
};

const PROGRAM_LABELS = {
  PhD: 'PhD',
  MSPhD: 'MS-PhD',
  MS: 'MS',
  BS: 'BS',
  Staff: 'Staff'
};

const PUB_TYPE_LABELS = {
  all: 'All',
  conference: 'Conference',
  journal: 'Journal',
  preprint: 'Preprint',
  patent: 'Patent'
};

const NEWS_SECTION_KEYS = ['labNews', 'gallery', 'videos'];

const cache = new Map();

function localize(value, locale) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return value[locale] || value.en || '';
}

function localizeList(value, locale) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  const localized = value[locale] || value.en || [];
  return Array.isArray(localized) ? localized : [];
}

function getInitials(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return '?';
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  return `${tokens[0][0] || ''}${tokens[1][0] || ''}`.toUpperCase();
}

async function fetchData(fileName) {
  if (cache.has(fileName)) {
    return cache.get(fileName);
  }

  const base = import.meta.env.BASE_URL || '/';
  const url = `${base}data/${fileName}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load ${fileName}: ${response.status}`);
  }

  const data = await response.json();
  cache.set(fileName, data);
  return data;
}

function sortTeamProfiles(profiles, status) {
  return [...profiles].sort((a, b) => {
    if (status === 'alumni') {
      const endDelta = (b.endYear || 0) - (a.endYear || 0);
      if (endDelta !== 0) {
        return endDelta;
      }
    }

    const startDelta = (b.startYear || 0) - (a.startYear || 0);
    if (startDelta !== 0) {
      return startDelta;
    }

    return localize(a.name, 'en').localeCompare(localize(b.name, 'en'));
  });
}

export async function loadTeamProfiles(locale, status = 'current') {
  const data = await fetchData('team.json');
  const filtered = data.filter((member) => member.status === status);

  const grouped = new Map();
  filtered.forEach((member) => {
    const role = member.role || (status === 'alumni' ? 'Alumni' : 'Graduate');
    if (!grouped.has(role)) {
      grouped.set(role, []);
    }
    grouped.get(role).push(member);
  });

  const orderedRoles = [
    ...ROLE_ORDER.filter((role) => grouped.has(role)),
    ...[...grouped.keys()].filter((role) => !ROLE_ORDER.includes(role)).sort((a, b) => String(a).localeCompare(String(b)))
  ];

  return orderedRoles.map((role) => {
    const members = sortTeamProfiles(grouped.get(role), status).map((member) => {
      const localizedName = localize(member.name, locale);
      const roleLabel = ROLE_LABELS[role] || role;

      return {
        ...member,
        localizedName,
        role,
        roleLabel,
        localizedInterests: localizeList(member.interests, locale),
        programLabel: PROGRAM_LABELS[member.program] || member.program || '',
        initials: getInitials(localizedName)
      };
    });

    return {
      role,
      label: ROLE_LABELS[role] || role,
      members
    };
  });
}

export function formatIEEE(pub, locale = 'en') {
  const chunks = [];
  const authors = (pub.authors || []).join(', ');
  const title = localize(pub.title, locale);

  if (authors) {
    chunks.push(`${authors},`);
  }

  if (title) {
    chunks.push(`"${title},"`);
  }

  if (pub.venue) {
    chunks.push(`${pub.venue},`);
  }

  if (pub.year) {
    chunks.push(String(pub.year));
  }

  if (pub.doi) {
    chunks.push(`doi: ${pub.doi}`);
  }

  return chunks.join(' ').trim();
}

export async function loadPublications(locale, filterType = 'all') {
  const data = await fetchData('publications.json');

  return data
    .filter((item) => filterType === 'all' || item.type === filterType)
    .sort((a, b) => {
      const yearDelta = (b.year || 0) - (a.year || 0);
      if (yearDelta !== 0) {
        return yearDelta;
      }

      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      return localize(a.title, locale).localeCompare(localize(b.title, locale));
    })
    .map((item) => ({
      ...item,
      localizedTitle: localize(item.title, locale),
      citation: formatIEEE(item, locale)
    }));
}

export function publicationTypeLabels(locale) {
  return PUB_TYPE_LABELS;
}

function normalizeNewsSection(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase();

  if (raw === 'labnews' || raw === 'lab-news' || raw === 'lab news' || raw === 'news') {
    return 'labNews';
  }
  if (raw === 'gallery' || raw === 'photos' || raw === 'photo') {
    return 'gallery';
  }
  if (raw === 'videos' || raw === 'video') {
    return 'videos';
  }
  return 'labNews';
}

function parseNewsDateValue(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return 0;
  }

  const parsed = Date.parse(raw);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const parts = raw.split(/[./-]/).filter(Boolean);
  const year = Number(parts[0]) || 0;
  const month = Math.min(12, Math.max(1, Number(parts[1]) || 1));
  const day = Math.min(31, Math.max(1, Number(parts[2]) || 1));
  return Date.UTC(year, month - 1, day);
}

function toSlug(value, fallback) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function normalizeNewsItems(items, sectionKey) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const title = String(item?.title || '').trim();
      const date = String(item?.date || '').trim();
      const summary = localize(item?.summary || item?.body || '', 'en');
      const id = String(item?.id || '').trim() || `${sectionKey}-${toSlug(title || date, String(index + 1))}`;
      const images = Array.isArray(item?.images)
        ? item.images.map((image) => String(image || '').trim()).filter(Boolean)
        : String(item?.image || '').trim()
          ? [String(item.image).trim()]
          : [];

      return {
        id,
        section: normalizeNewsSection(item?.section || sectionKey),
        date,
        title,
        summary,
        url: String(item?.url || '').trim(),
        videoUrl: String(item?.videoUrl || '').trim(),
        images
      };
    })
    .sort((a, b) => {
      const dateDelta = parseNewsDateValue(b.date) - parseNewsDateValue(a.date);
      if (dateDelta !== 0) {
        return dateDelta;
      }
      return String(a.title || '').localeCompare(String(b.title || ''));
    });
}

function normalizePiLinks(value) {
  const input = value && typeof value === 'object' ? value : {};
  return {
    linkedin: String(input.linkedin || '').trim(),
    webOfScience: String(input.webOfScience || '').trim(),
    orcid: String(input.orcid || '').trim(),
    scopus: String(input.scopus || '').trim(),
    googleScholar: String(input.googleScholar || '').trim(),
    researchGate: String(input.researchGate || '').trim()
  };
}

function normalizeInstagram(value) {
  const input = value && typeof value === 'object' ? value : {};
  return {
    handle: String(input.handle || '').trim(),
    profileUrl: String(input.profileUrl || '').trim(),
    recent: normalizeNewsItems(input.recent, 'gallery').map((item) => ({
      ...item,
      section: 'instagram'
    }))
  };
}

export async function loadNewsFeed() {
  const data = await fetchData('news.json');
  const sectionsSource = data?.sections && typeof data.sections === 'object' ? data.sections : {};

  const sections = NEWS_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = normalizeNewsItems(sectionsSource[key], key);
    return acc;
  }, {});

  return {
    updatedAt: String(data?.updatedAt || '').trim(),
    sections,
    instagram: normalizeInstagram(data?.instagram),
    piLinks: normalizePiLinks(data?.piLinks)
  };
}

export async function loadLatestNewsItems(limit = 6) {
  const feed = await loadNewsFeed();
  const merged = [
    ...(feed.sections?.labNews || []),
    ...(feed.sections?.gallery || []),
    ...(feed.sections?.videos || [])
  ];

  const deduped = [...new Map(merged.map((item) => [item.id, item])).values()];
  deduped.sort((a, b) => {
    const dateDelta = parseNewsDateValue(b.date) - parseNewsDateValue(a.date);
    if (dateDelta !== 0) {
      return dateDelta;
    }
    return String(a.title || '').localeCompare(String(b.title || ''));
  });

  return deduped.slice(0, Math.max(1, limit)).map((item) => ({
    date: item.date,
    title: item.title,
    body: item.summary || ''
  }));
}
