const ROLE_ORDER = ['PI', 'Researcher', 'Graduate', 'Undergraduate', 'Alumni'];

const ROLE_LABELS = {
  en: {
    PI: 'Principal Investigator',
    Researcher: 'Researchers',
    Graduate: 'Graduate Students',
    Undergraduate: 'Undergraduate Students',
    Alumni: 'Alumni'
  },
  ko: {
    PI: '지도교수',
    Researcher: '연구원',
    Graduate: '대학원생',
    Undergraduate: '학부연구생',
    Alumni: '동문'
  }
};

const PROGRAM_LABELS = {
  en: {
    PhD: 'PhD',
    MSPhD: 'MS-PhD',
    MS: 'MS',
    BS: 'BS',
    Staff: 'Staff'
  },
  ko: {
    PhD: '박사과정',
    MSPhD: '석박통합과정',
    MS: '석사과정',
    BS: '학사과정',
    Staff: '스태프'
  }
};

const PUB_TYPE_LABELS = {
  en: {
    all: 'All',
    conference: 'Conference',
    journal: 'Journal',
    preprint: 'Preprint',
    patent: 'Patent'
  },
  ko: {
    all: '전체',
    conference: '학술대회',
    journal: '저널',
    preprint: '프리프린트',
    patent: '특허'
  }
};

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

function sortMembers(members, status) {
  return [...members].sort((a, b) => {
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

export async function loadMembers(locale, status = 'current') {
  const data = await fetchData('members.json');
  const filtered = data.filter((member) => member.status === status);

  const grouped = new Map();
  filtered.forEach((member) => {
    const role = member.role || (status === 'alumni' ? 'Alumni' : 'Graduate');
    if (!grouped.has(role)) {
      grouped.set(role, []);
    }
    grouped.get(role).push(member);
  });

  return ROLE_ORDER.filter((role) => grouped.has(role)).map((role) => {
    const members = sortMembers(grouped.get(role), status).map((member) => {
      const localizedName = localize(member.name, locale);

      return {
        ...member,
        localizedName,
        role,
        roleLabel: ROLE_LABELS[locale][role] || role,
        localizedInterests: localizeList(member.interests, locale),
        programLabel: PROGRAM_LABELS[locale][member.program] || member.program || '',
        initials: getInitials(localizedName)
      };
    });

    return {
      role,
      label: ROLE_LABELS[locale][role] || role,
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
  return PUB_TYPE_LABELS[locale] || PUB_TYPE_LABELS.en;
}
