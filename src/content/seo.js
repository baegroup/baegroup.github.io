export const SITE_URL = 'https://www.baelab.khu.ac.kr';
export const SITE_NAME = 'Bae Lab | 배재형 교수 연구실';
export const DEFAULT_SOCIAL_IMAGE = '/assets/img/home/hero/cover-1920.jpg';

export const SEO_ROUTES = [
  {
    path: '/',
    title: 'Bae Lab | 배재형 교수 연구실 · 경희대학교',
    description:
      '경희대학교 화학공학과 배재형 교수 연구실(Bae Lab)은 기능성 소재와 적층제조 기술을 기반으로 에너지·환경·바이오 응용을 연구합니다.'
  },
  {
    path: '/team',
    title: '배재형 교수 및 구성원 | Bae Lab',
    description:
      '배재형 교수와 Bae Lab 연구진을 소개합니다. 경희대학교 화학공학과에서 기능성 소재, 적층제조, 에너지 및 바이오 소자를 연구합니다.'
  },
  {
    path: '/research',
    title: '연구 분야 | 배재형 교수 연구실 (Bae Lab)',
    description:
      '배재형 교수 연구실의 첨단 3D 프린팅, 에너지·환경 시스템, 바이오 기능성 소재 및 소자 연구를 소개합니다.'
  },
  {
    path: '/publications',
    title: '논문 및 특허 | 배재형 교수 연구실 (Bae Lab)',
    description:
      'Bae Lab의 기능성 소재, 적층제조, 에너지 및 바이오 공학 분야 논문과 특허, Google Scholar 연구 성과를 확인할 수 있습니다.'
  },
  {
    path: '/news',
    title: '연구실 소식 | 배재형 교수 연구실 (Bae Lab)',
    description:
      '경희대학교 화학공학과 Bae Lab의 최신 연구 성과, 수상, 학회 활동, 연구실 행사 및 갤러리 소식을 전합니다.'
  },
  {
    path: '/join',
    title: '대학원생 모집 | 배재형 교수 연구실 (Bae Lab)',
    description:
      '배재형 교수 연구실의 석사, 박사, 석박통합과정 및 학부연구생 모집 정보와 지원 방법을 안내합니다.'
  },
  {
    path: '/contact',
    title: '연락처 및 위치 | 배재형 교수 연구실 (Bae Lab)',
    description:
      '경희대학교 화학공학과 배재형 교수 연구실의 이메일, 전화번호, 연구실 주소와 찾아오는 길을 확인할 수 있습니다.'
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
  return SEO_ROUTES.find((item) => item.path === normalized) || SEO_ROUTES[0];
}

export function absoluteSiteUrl(path = '/') {
  const normalized = path === '/' ? '/' : `/${String(path).replace(/^\/+|\/+$/g, '')}/`;
  return `${SITE_URL}${normalized}`;
}

export function getStructuredDataForPath(pathname = '/') {
  const path = getSeoForPath(pathname).path;
  const pageUrl = absoluteSiteUrl(path);
  const organizationId = `${SITE_URL}/#organization`;
  const personId = `${SITE_URL}/team/#jaehyeong-bae`;
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
      'https://www.linkedin.com/in/baelabkhu/'
    ]
  };

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: 'Jaehyeong Bae',
    alternateName: ['배재형', 'Bae Jaehyeong'],
    jobTitle: 'Assistant Professor',
    email: 'jbae@khu.ac.kr',
    url: `${SITE_URL}/team/`,
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

  const webPage = {
    '@type': path === '/team' ? 'ProfilePage' : 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: getSeoForPath(path).title,
    description: getSeoForPath(path).description,
    isPartOf: { '@id': websiteId },
    about: path === '/team' ? { '@id': personId } : { '@id': organizationId },
    inLanguage: ['ko', 'en']
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
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
    ]
  };
}
