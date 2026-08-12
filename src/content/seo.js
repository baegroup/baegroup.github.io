export const SITE_URL = 'https://www.baelab.khu.ac.kr';
export const SITE_NAME = 'Bae Lab | 배재형 교수 연구실';
export const DEFAULT_SOCIAL_IMAGE = '/assets/img/home/hero/cover-1920.jpg';
export const DEFAULT_SOCIAL_IMAGE_WIDTH = 1920;
export const DEFAULT_SOCIAL_IMAGE_HEIGHT = 2560;

export const SEO_ROUTES = [
  {
    path: '/',
    title: 'Bae Lab | 배재형 교수 연구실 · 경희대학교',
    description:
      '경희대학교 화학공학과 배재형 교수 연구실(Bae Lab)은 기능성 소재와 첨단 적층제조를 기반으로 에너지·환경·바이오 응용을 연구합니다.'
  },
  {
    path: '/team',
    title: 'Team | Bae Lab · Kyung Hee University',
    description:
      'Meet the researchers and students of Bae Lab in the Department of Chemical Engineering at Kyung Hee University.'
  },
  {
    path: '/team/jaehyeong-bae',
    title: '배재형 교수 (Jaehyeong Bae) | Bae Lab · 경희대학교',
    description:
      '경희대학교 화학공학과 배재형 교수는 기능성 소재와 첨단 적층제조를 기반으로 에너지·환경·바이오 응용을 연구합니다.'
  },
  {
    path: '/team/members',
    title: 'Lab Members | Bae Lab · Kyung Hee University',
    description:
      'Meet the graduate and undergraduate researchers working across functional materials and additive manufacturing at Bae Lab.'
  },
  {
    path: '/team/staff',
    title: 'Researchers and Staff | Bae Lab · Kyung Hee University',
    description:
      'Meet the researchers and staff supporting multidisciplinary research and laboratory operations at Bae Lab.'
  },
  {
    path: '/team/alumni',
    title: 'Alumni | Bae Lab · Kyung Hee University',
    description:
      'Explore the alumni community of Bae Lab in the Department of Chemical Engineering at Kyung Hee University.'
  },
  {
    path: '/research',
    title: 'Research | Functional Materials and Additive Manufacturing · Bae Lab',
    description:
      'Explore Bae Lab research in advanced 3D printing, energy and environmental systems, and functional materials for biomedical devices.'
  },
  {
    path: '/publications',
    title: 'Publications | Bae Lab · Kyung Hee University',
    description:
      'Browse Bae Lab journal articles, current manuscripts, patents, and research profiles in functional materials and additive manufacturing.'
  },
  {
    path: '/publications/patents',
    title: 'Patents | Bae Lab · Kyung Hee University',
    description:
      'Browse patents from Bae Lab covering functional materials, advanced manufacturing, energy, environmental, and biomedical technologies.'
  },
  {
    path: '/news',
    title: 'News | Bae Lab · Kyung Hee University',
    description:
      'Read the latest Bae Lab research highlights, awards, conference activities, team milestones, lab life, and videos.'
  },
  {
    path: '/join',
    title: 'Join Our Team | Graduate Opportunities at Bae Lab',
    description:
      'Learn about M.S., Ph.D., integrated M.S.–Ph.D., and undergraduate research opportunities at Bae Lab, Kyung Hee University.'
  },
  {
    path: '/contact',
    title: 'Contact and Location | Bae Lab · Kyung Hee University',
    description:
      'Find the email, telephone, campus address, laboratory location, and directions for Bae Lab at Kyung Hee University.'
  },
  {
    path: '/ko',
    title: '배재형 교수 연구실 | Bae Lab · 경희대학교 화학공학과',
    description:
      '경희대학교 화학공학과 배재형 교수 연구실의 기능성 소재, 첨단 적층제조, 에너지·환경·바이오 연구와 구성원 및 모집 정보를 소개합니다.'
  }
];

export function normalizeSeoPath(pathname) {
  const normalized = String(pathname || '/')
    .replace(/^\/en(?=\/|$)/, '')
    .replace(/\/+$/, '');
  return normalized || '/';
}

export function getSeoForPath(pathname) {
  const normalized = normalizeSeoPath(pathname);
  const exact = SEO_ROUTES.find((item) => item.path === normalized);
  if (exact) return exact;
  if (normalized.startsWith('/news/')) return { ...SEO_ROUTES.find((item) => item.path === '/news'), path: normalized };
  if (normalized.startsWith('/publications/')) return { ...SEO_ROUTES.find((item) => item.path === '/publications'), path: normalized };
  return SEO_ROUTES[0];
}

export function absoluteSiteUrl(path = '/') {
  const normalized = path === '/' ? '/' : `/${String(path).replace(/^\/+|\/+$/g, '')}/`;
  return `${SITE_URL}${normalized}`;
}

export function getStructuredDataForPath(pathname = '/', metadataOverride = null) {
  const metadata = metadataOverride || getSeoForPath(pathname);
  const path = normalizeSeoPath(metadata.path || pathname);
  const pageUrl = absoluteSiteUrl(path);
  const organizationId = `${SITE_URL}/#organization`;
  const personId = `${SITE_URL}/team/jaehyeong-bae/#person`;
  const websiteId = `${SITE_URL}/#website`;

  const organization = {
    '@type': 'ResearchOrganization',
    '@id': organizationId,
    name: 'Bae Lab',
    alternateName: ['배재형 교수 연구실', '배랩', 'Functional Materials Additive Manufacturing Lab'],
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/img/lab-logo.png`,
    email: 'jbae@khu.ac.kr',
    telephone: '+82-31-201-2477',
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Kyung Hee University',
      alternateName: '경희대학교',
      url: 'https://www.khu.ac.kr/'
    },
    sameAs: [
      'https://www.instagram.com/baelab.khu/',
      'https://www.linkedin.com/in/baelabkhu/',
      'https://app.rndcircle.io/lab/48cf15b1-76b5-4046-8020-09b4d10e184a'
    ]
  };

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: 'Jaehyeong Bae',
    alternateName: ['배재형', 'Bae Jaehyeong'],
    jobTitle: 'Assistant Professor',
    email: 'jbae@khu.ac.kr',
    image: `${SITE_URL}/assets/img/team/notion/bae-jaehyeong.jpg`,
    url: `${SITE_URL}/team/jaehyeong-bae/`,
    affiliation: { '@id': organizationId },
    sameAs: [
      'https://orcid.org/0000-0001-6426-4310',
      'https://scholar.google.com/citations?user=F4hhc78AAAAJ&hl=en',
      'https://khu.elsevierpure.com/en/persons/jaehyeong-bae/',
      'https://www.linkedin.com/in/baelabkhu/'
    ],
    knowsAbout: [
      'Additive manufacturing',
      'Functional materials',
      'Energy harvesting',
      'Environmental technology',
      'Biomedical devices'
    ]
  };

  const isProfessorPage = path === '/team/jaehyeong-bae';
  const isKoreanPage = path === '/ko';
  const webPage = {
    '@type': isProfessorPage ? 'ProfilePage' : 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: metadata.title,
    description: metadata.description,
    isPartOf: { '@id': websiteId },
    about: isProfessorPage ? { '@id': personId } : { '@id': organizationId },
    inLanguage: isKoreanPage ? 'ko' : 'en'
  };
  if (isProfessorPage) {
    webPage.mainEntity = { '@id': personId };
  }

  const graph = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${SITE_URL}/`,
      name: 'Bae Lab',
      alternateName: '배재형 교수 연구실',
      publisher: { '@id': organizationId },
      inLanguage: ['ko', 'en']
    },
    webPage,
    organization,
    person
  ];

  if (metadata.schemaType === 'NewsArticle') {
    graph.push({
      '@type': 'NewsArticle',
      '@id': `${pageUrl}#article`,
      headline: metadata.articleTitle || metadata.title,
      description: metadata.description,
      datePublished: metadata.datePublished,
      dateModified: metadata.dateModified || metadata.datePublished,
      image: metadata.image ? [metadata.image] : undefined,
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      author: { '@id': organizationId },
      publisher: { '@id': organizationId }
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
