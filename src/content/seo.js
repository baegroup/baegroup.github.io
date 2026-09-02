export const SITE_URL = 'https://baelab.khu.ac.kr';
export const SITE_NAME = 'Bae Lab at Kyung Hee University';
export const DEFAULT_SOCIAL_IMAGE = '/assets/img/social/bae-lab-social.jpg';
export const DEFAULT_SOCIAL_IMAGE_WIDTH = 1200;
export const DEFAULT_SOCIAL_IMAGE_HEIGHT = 630;

export const RESEARCH_TOPICS = [
  'Additive manufacturing',
  '3D printing',
  'Direct ink writing',
  'Functional materials',
  'Aerogel additive manufacturing',
  'Liquid metal printing',
  'Functional hydrogels',
  'Carbon capture',
  'Lithium-metal batteries',
  'Energy harvesting',
  'Chemical and temperature sensors',
  'Embedded 3D printing',
  'Biomedical devices'
];

export const KOREAN_RESEARCH_TOPICS = [
  '첨단 적층제조',
  '3D 프린팅',
  '직접잉크쓰기',
  '기능성 소재',
  '에어로젤 적층제조',
  '액체금속 프린팅',
  '기능성 하이드로젤',
  '탄소포집',
  '리튬금속전지',
  '에너지 하베스팅',
  '화학·온도 센서',
  '임베디드 3D 프린팅',
  '생체의료 소자'
];

export const SEO_ROUTES = [
  {
    path: '/',
    title: 'Bae Lab at Kyung Hee University | 배재형 교수 연구실',
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
    title: 'Current Members | Bae Lab · Kyung Hee University',
    description:
      'Meet the researchers, graduate and undergraduate students, and administrative staff of Bae Lab at Kyung Hee University.'
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
      'Browse Bae Lab journal articles, current manuscripts, conference presentations, patents, and research profiles in functional materials and additive manufacturing.'
  },
  {
    path: '/publications/patents',
    title: 'Patents | Bae Lab · Kyung Hee University',
    description:
      'Browse patents from Bae Lab covering functional materials, advanced manufacturing, energy, environmental, and biomedical technologies.'
  },
  {
    path: '/publications/conferences',
    title: 'Conference Presentations | Bae Lab · Kyung Hee University',
    description:
      'Browse poster, oral, and invited conference presentations by Bae Lab members in functional materials and additive manufacturing.'
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
    path: '/privacy',
    title: 'Privacy and Analytics | Bae Lab · Kyung Hee University',
    description:
      'Learn how Bae Lab uses consent-based Google Analytics to measure aggregate visitor countries, traffic sources, page usage, and engagement.'
  },
  {
    path: '/ko',
    title: '배재형 교수 연구실 | Bae Lab · 경희대학교 화학공학과',
    description:
      '경희대학교 화학공학과 배재형 교수 연구실의 3D 프린팅·첨단 적층제조, 기능성 소재, 탄소포집, 에너지·바이오 연구와 주요 논문을 소개합니다.'
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
  const departmentId = 'https://chemeng.khu.ac.kr/#organization';
  const universityId = 'https://www.khu.ac.kr/#organization';

  const university = {
    '@type': 'CollegeOrUniversity',
    '@id': universityId,
    name: 'Kyung Hee University',
    alternateName: '경희대학교',
    url: 'https://www.khu.ac.kr/'
  };

  const department = {
    '@type': 'Organization',
    '@id': departmentId,
    name: 'Department of Chemical Engineering, Kyung Hee University',
    alternateName: '경희대학교 화학공학과',
    url: 'https://chemeng.khu.ac.kr/chemeng/user/main/view.do',
    parentOrganization: { '@id': universityId }
  };

  const organization = {
    '@type': 'ResearchOrganization',
    '@id': organizationId,
    name: 'Bae Lab at Kyung Hee University',
    alternateName: ['Bae Lab', 'Bae Lab KHU', '배재형 교수 연구실', '배랩', 'Additive Manufacturing of Functional Materials Lab', 'Functional Materials Additive Manufacturing Lab'],
    description:
      'Bae Lab integrates materials design and process engineering to transform complex functional materials into precise and scalable manufacturing technologies.',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/img/lab-logo.png`,
    email: 'jbae@khu.ac.kr',
    telephone: '+82-31-201-2477',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'research and collaboration inquiries',
      email: 'jbae@khu.ac.kr',
      telephone: '+82-31-201-2477',
      availableLanguage: ['English', 'Korean']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1732 Deogyeong-daero, Giheung-gu',
      addressLocality: 'Yongin-si',
      addressRegion: 'Gyeonggi-do',
      postalCode: '17104',
      addressCountry: 'KR'
    },
    parentOrganization: { '@id': departmentId },
    member: { '@id': personId },
    knowsAbout: path === '/ko' ? [...RESEARCH_TOPICS, ...KOREAN_RESEARCH_TOPICS] : RESEARCH_TOPICS,
    sameAs: [
      'https://www.instagram.com/baelab.khu/',
      'https://www.linkedin.com/in/baelabkhu/',
      'https://app.rndcircle.io/lab/425f0660-0149-4868-967d-345fb251a5a7'
    ]
  };

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: 'Jaehyeong Bae',
    alternateName: ['배재형', 'Bae Jaehyeong'],
    jobTitle: 'Assistant Professor',
    description:
      'Jaehyeong Bae conducts multidisciplinary research at the intersection of functional materials, additive manufacturing, and energy and environmental science.',
    email: 'jbae@khu.ac.kr',
    image: `${SITE_URL}/assets/img/team/notion/bae-jaehyeong.jpg`,
    url: `${SITE_URL}/team/jaehyeong-bae/`,
    affiliation: [{ '@id': organizationId }, { '@id': departmentId }],
    memberOf: { '@id': organizationId },
    worksFor: { '@id': departmentId },
    sameAs: [
      'https://orcid.org/0000-0001-6426-4310',
      'https://scholar.google.com/citations?user=F4hhc78AAAAJ&hl=en',
      'https://www.scopus.com/authid/detail.uri?authorId=57211514022',
      'https://www.webofscience.com/wos/author/record/GVR-7870-2022',
      'https://khu.elsevierpure.com/en/persons/jaehyeong-bae/',
      'https://chemeng.khu.ac.kr/chemeng/user/professor/list.do?menuNo=17600016',
      'https://www.linkedin.com/in/baelabkhu/'
    ],
    knowsAbout: path === '/ko' ? [...RESEARCH_TOPICS, ...KOREAN_RESEARCH_TOPICS] : RESEARCH_TOPICS
  };

  const isProfessorPage = path === '/team/jaehyeong-bae';
  const isKoreanPage = path === '/ko';
  const pageType = isProfessorPage
    ? 'ProfilePage'
    : path === '/contact'
      ? 'ContactPage'
      : path === '/ko' || path === '/team'
        ? 'AboutPage'
        : path === '/research' || path.startsWith('/publications') || path === '/news'
          ? 'CollectionPage'
          : 'WebPage';
  const webPage = {
    '@type': pageType,
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: metadata.title,
    description: metadata.description,
    isPartOf: { '@id': websiteId },
    about: isProfessorPage ? { '@id': personId } : { '@id': organizationId },
    inLanguage: isKoreanPage ? 'ko' : 'en'
  };
  const primaryImageId = `${pageUrl}#primaryimage`;
  const primaryImageUrl = metadata.image || `${SITE_URL}${DEFAULT_SOCIAL_IMAGE}`;
  const primaryImage = {
    '@type': 'ImageObject',
    '@id': primaryImageId,
    url: primaryImageUrl,
    contentUrl: primaryImageUrl,
    caption: metadata.imageAlt || 'Bae Lab research at Kyung Hee University',
    width: metadata.image ? undefined : DEFAULT_SOCIAL_IMAGE_WIDTH,
    height: metadata.image ? undefined : DEFAULT_SOCIAL_IMAGE_HEIGHT,
    representativeOfPage: true
  };
  webPage.primaryImageOfPage = { '@id': primaryImageId };
  webPage.thumbnailUrl = primaryImageUrl;
  if (isProfessorPage) {
    webPage.mainEntity = { '@id': personId };
  } else if (path === '/' || path === '/ko' || path === '/contact') {
    webPage.mainEntity = { '@id': organizationId };
  }

  const graph = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${SITE_URL}/`,
      name: 'Bae Lab at Kyung Hee University',
      alternateName: ['Bae Lab KHU', '배재형 교수 연구실', 'Bae Lab'],
      publisher: { '@id': organizationId },
      inLanguage: ['ko', 'en']
    },
    webPage,
    primaryImage,
    university,
    department,
    organization,
    person
  ];

  if (Array.isArray(metadata.itemListElements) && metadata.itemListElements.length) {
    const itemListId = `${pageUrl}#item-list`;
    graph.push({
      '@type': 'ItemList',
      '@id': itemListId,
      name: metadata.itemListName || metadata.title,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: metadata.itemListElements.length,
      itemListElement: metadata.itemListElements.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item
      }))
    });
    webPage.mainEntity = { '@id': itemListId };
  }

  if (metadata.schemaType === 'NewsArticle') {
    const articleId = `${pageUrl}#article`;
    graph.push({
      '@type': 'NewsArticle',
      '@id': articleId,
      headline: metadata.articleTitle || metadata.title,
      description: metadata.description,
      datePublished: metadata.datePublished,
      dateModified: metadata.dateModified || metadata.datePublished,
      image: { '@id': primaryImageId },
      articleSection: metadata.articleSection || 'Bae Lab News',
      keywords: metadata.keywords || RESEARCH_TOPICS,
      inLanguage: metadata.language || 'en',
      about: { '@id': organizationId },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      author: { '@id': organizationId },
      publisher: { '@id': organizationId }
    });
    webPage.mainEntity = { '@id': articleId };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
