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
    MS: 'MS',
    BS: 'BS',
    Staff: 'Staff'
  },
  ko: {
    PhD: '박사과정',
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

function detectLocale() {
  return document.documentElement.lang.startsWith('ko') ? 'ko' : 'en';
}

function getSiteBasePath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const localeIndex = parts.findIndex((part) => part === 'en' || part === 'ko');

  if (localeIndex >= 0) {
    const baseParts = parts.slice(0, localeIndex);
    return `/${baseParts.length ? `${baseParts.join('/')}/` : ''}`;
  }

  if (parts.length <= 1) {
    return parts.length === 0 ? '/' : `/${parts[0]}/`;
  }

  return '/';
}

function resolveAssetPath(path) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith('/')) {
    const base = getSiteBasePath();
    const url = new URL(base, window.location.origin);
    return new URL(path.replace(/^\/+/, ''), url).href;
  }

  return new URL(path, window.location.href).href;
}

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

  const url = new URL(`../../data/${fileName}`, import.meta.url);
  const response = await fetch(url.href, { cache: 'no-store' });
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

    const aName = localize(a.name, 'en');
    const bName = localize(b.name, 'en');
    return aName.localeCompare(bName);
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

  return ROLE_ORDER
    .filter((role) => grouped.has(role))
    .map((role) => {
      const members = sortMembers(grouped.get(role), status).map((member) => {
        const localizedName = localize(member.name, locale);
        return {
          ...member,
          role,
          roleLabel: ROLE_LABELS[locale][role] || role,
          localizedName,
          localizedInterests: localizeList(member.interests, locale),
          programLabel: PROGRAM_LABELS[locale][member.program] || member.program || '',
          photoUrl: resolveAssetPath(member.photo),
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
  const title = localize(pub.title, locale);
  const authors = (pub.authors || []).join(', ');
  const venue = pub.venue || '';
  const year = pub.year || '';

  const chunks = [];
  if (authors) {
    chunks.push(`${authors},`);
  }
  if (title) {
    chunks.push(`"${title},"`);
  }
  if (venue) {
    chunks.push(`${venue},`);
  }
  if (year) {
    chunks.push(String(year));
  }
  if (pub.doi) {
    chunks.push(`doi: ${pub.doi}`);
  }

  return chunks.join(' ').trim();
}

export async function loadPublications(locale, filterType = 'all') {
  const data = await fetchData('publications.json');

  return data
    .filter((pub) => filterType === 'all' || pub.type === filterType)
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
    .map((pub) => ({
      ...pub,
      localizedTitle: localize(pub.title, locale),
      citation: formatIEEE(pub, locale)
    }));
}

function memberCard(member, locale) {
  const interests = member.localizedInterests.length
    ? `<span class="pill">${member.localizedInterests.join(', ')}</span>`
    : '';

  const periodLabel =
    locale === 'ko'
      ? `${member.startYear || '-'} ~ ${member.endYear || '현재'}`
      : `${member.startYear || '-'} - ${member.endYear || 'Present'}`;

  const emailLabel = locale === 'ko' ? '이메일' : 'Email';
  const websiteLabel = locale === 'ko' ? '홈페이지' : 'Website';

  const imageMarkup = member.photoUrl
    ? `<img class="member-photo" src="${member.photoUrl}" alt="${member.localizedName}" loading="lazy">`
    : '';

  const avatarClass = member.photoUrl ? 'member-avatar sr-only-fallback' : 'member-avatar';

  return `
    <article class="member-card">
      <div>
        ${imageMarkup}
        <div class="${avatarClass}" aria-hidden="true">${member.initials}</div>
      </div>
      <div>
        <p class="member-name">${member.localizedName}</p>
        <p class="member-role">${member.programLabel || member.roleLabel}</p>
        <div class="member-meta">
          <span class="pill">${periodLabel}</span>
          ${interests}
        </div>
        <div class="member-meta">
          ${member.email ? `<a href="mailto:${member.email}">${emailLabel}</a>` : ''}
          ${member.website ? `<a href="${member.website}" target="_blank" rel="noopener noreferrer">${websiteLabel}</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

async function renderMembersPage() {
  const root = document.querySelector('[data-members-root]');
  if (!root) {
    return;
  }

  const locale = detectLocale();
  const emptyMessage =
    locale === 'ko' ? '해당 분류에 등록된 구성원이 없습니다.' : 'No members found in this category.';

  const buttons = document.querySelectorAll('[data-member-status]');
  let activeStatus = document.querySelector('[data-member-status].active')?.dataset.memberStatus || 'current';

  async function render() {
    try {
      const groups = await loadMembers(locale, activeStatus);
      if (!groups.length) {
        root.innerHTML = `<p class="notice">${emptyMessage}</p>`;
        return;
      }

      root.innerHTML = groups
        .map(
          (group) => `
            <section class="member-group" aria-labelledby="group-${group.role.toLowerCase()}">
              <h3 id="group-${group.role.toLowerCase()}">${group.label}</h3>
              <div class="member-grid">
                ${group.members.map((member) => memberCard(member, locale)).join('')}
              </div>
            </section>
          `
        )
        .join('');

      root.querySelectorAll('.member-card').forEach((card) => {
        const image = card.querySelector('.member-photo');
        const fallback = card.querySelector('.sr-only-fallback');

        if (!fallback) {
          return;
        }

        if (!image) {
          fallback.classList.remove('sr-only-fallback');
          return;
        }

        image.addEventListener('error', () => {
          image.remove();
          fallback.classList.remove('sr-only-fallback');
        });
      });
    } catch (error) {
      root.innerHTML = `<p class="notice">${error.message}</p>`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      buttons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      activeStatus = button.dataset.memberStatus || 'current';
      await render();
    });
  });

  await render();
}

function publicationLinks(pub, locale) {
  const links = [];
  if (pub.doi) {
    links.push(`<a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer">DOI</a>`);
  }
  if (pub.url) {
    links.push(
      `<a href="${pub.url}" target="_blank" rel="noopener noreferrer">${locale === 'ko' ? '원문 링크' : 'Paper Link'}</a>`
    );
  }

  if (links.length === 0) {
    return '';
  }

  return `<div class="pub-links">${links.join('')}</div>`;
}

function renderPublicationGroups(publications, locale) {
  const byYear = new Map();
  publications.forEach((pub) => {
    if (!byYear.has(pub.year)) {
      byYear.set(pub.year, []);
    }
    byYear.get(pub.year).push(pub);
  });

  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(
      ([year, items]) => `
        <section aria-labelledby="year-${year}">
          <h3 id="year-${year}" class="pub-year">${year}</h3>
          <ol class="pub-list">
            ${items
              .map(
                (pub) => `
                  <li class="pub-item">
                    <p class="pub-title">${pub.localizedTitle}</p>
                    <p class="pub-citation">${pub.citation}</p>
                    ${publicationLinks(pub, locale)}
                  </li>
                `
              )
              .join('')}
          </ol>
        </section>
      `
    )
    .join('');
}

async function renderPublicationsPage() {
  const root = document.querySelector('[data-publications-root]');
  if (!root) {
    return;
  }

  const locale = detectLocale();
  const buttons = document.querySelectorAll('[data-publication-filter]');
  let activeType = document.querySelector('[data-publication-filter].active')?.dataset.publicationFilter || 'all';

  buttons.forEach((button) => {
    const type = button.dataset.publicationFilter || 'all';
    button.textContent = PUB_TYPE_LABELS[locale][type] || type;
  });

  async function render() {
    try {
      const publications = await loadPublications(locale, activeType);
      if (!publications.length) {
        root.innerHTML =
          locale === 'ko'
            ? '<p class="notice">해당 조건의 연구 성과가 없습니다.</p>'
            : '<p class="notice">No publications found for this filter.</p>';
        return;
      }

      root.innerHTML = renderPublicationGroups(publications, locale);
    } catch (error) {
      root.innerHTML = `<p class="notice">${error.message}</p>`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      buttons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      activeType = button.dataset.publicationFilter || 'all';
      await render();
    });
  });

  await render();
}

async function bootstrap() {
  await Promise.all([renderMembersPage(), renderPublicationsPage()]);
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch((error) => {
    console.error(error);
  });
});
