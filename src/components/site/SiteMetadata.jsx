import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  absoluteSiteUrl,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  getSeoForPath,
  getStructuredDataForPath,
  normalizeSeoPath,
  SITE_NAME,
  SITE_URL
} from '@/content/seo';

function setMeta(selector, attribute, key, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function SiteMetadata() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const metadata = getSeoForPath(pathname);
    const canonicalUrl = absoluteSiteUrl(metadata.path);
    const socialImageUrl = `${SITE_URL}${DEFAULT_SOCIAL_IMAGE}`;
    const normalizedPath = normalizeSeoPath(pathname);
    let routeMarker = document.head.querySelector('meta[name="seo-route"]');
    const prerenderedPath = routeMarker?.getAttribute('content');

    document.documentElement.lang = normalizedPath === '/ko' ? 'ko' : 'en';
    if (prerenderedPath && normalizeSeoPath(prerenderedPath) === normalizedPath) {
      return;
    }

    document.title = metadata.title;
    setMeta('meta[name="description"]', 'name', 'description', metadata.description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    setMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', metadata.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', socialImageUrl);
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', String(DEFAULT_SOCIAL_IMAGE_WIDTH));
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', String(DEFAULT_SOCIAL_IMAGE_HEIGHT));
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', 'Bae Lab research at Kyung Hee University');
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metadata.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', socialImageUrl);
    setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', 'Bae Lab research at Kyung Hee University');

    if (!routeMarker) {
      routeMarker = document.createElement('meta');
      routeMarker.setAttribute('name', 'seo-route');
      document.head.appendChild(routeMarker);
    }
    routeMarker.setAttribute('content', normalizedPath);

    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => element.remove());
    if (normalizedPath === '/' || normalizedPath === '/ko') {
      [
        ['en', `${SITE_URL}/`],
        ['ko', `${SITE_URL}/ko/`],
        ['x-default', `${SITE_URL}/`]
      ].forEach(([hreflang, href]) => {
        const alternate = document.createElement('link');
        alternate.setAttribute('rel', 'alternate');
        alternate.setAttribute('hreflang', hreflang);
        alternate.setAttribute('href', href);
        document.head.appendChild(alternate);
      });
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    let structuredData = document.head.querySelector('script#site-structured-data');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = 'site-structured-data';
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(getStructuredDataForPath(metadata.path));
  }, [pathname]);

  return null;
}
