export const SITE_URL = 'https://baegroup.github.io';
export const SITE_NAME = 'Bae Lab';
export const DEFAULT_SOCIAL_IMAGE = '/assets/img/home/hero/cover-1920.jpg';

export const SEO_ROUTES = [
  {
    path: '/',
    title: 'Bae Lab | Functional Materials Additive Manufacturing',
    description:
      'Bae Lab at Kyung Hee University develops functional materials and additive manufacturing technologies for energy, environment, and biomedical applications.'
  },
  {
    path: '/team',
    title: 'Team | Bae Lab',
    description:
      'Meet the Bae Lab team of researchers working across chemical engineering, materials science, additive manufacturing, and functional devices.'
  },
  {
    path: '/research',
    title: 'Research | Bae Lab',
    description:
      'Explore Bae Lab research in advanced printing technologies, energy and environmental systems, and biomedical materials and devices.'
  },
  {
    path: '/publications',
    title: 'Publications | Bae Lab',
    description:
      'Browse Bae Lab journal articles, patents, and research publications in functional materials, additive manufacturing, energy, and biomedical engineering.'
  },
  {
    path: '/news',
    title: 'News | Bae Lab',
    description:
      'Read the latest Bae Lab news, awards, research highlights, gallery updates, and laboratory activities at Kyung Hee University.'
  },
  {
    path: '/join',
    title: 'Join Our Team | Bae Lab',
    description:
      'Learn about graduate, undergraduate, and postdoctoral research opportunities with Bae Lab at Kyung Hee University.'
  },
  {
    path: '/contact',
    title: 'Contact | Bae Lab',
    description:
      'Contact Bae Lab in the Department of Chemical Engineering at Kyung Hee University and find the laboratory address and directions.'
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
  const normalized = path === '/' ? '/' : `/${String(path).replace(/^\/+|\/+$/g, '')}`;
  return `${SITE_URL}${normalized}`;
}
