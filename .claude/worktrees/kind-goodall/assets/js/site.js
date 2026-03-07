(function () {
  const LOCALES = ['en', 'ko'];

  function getCurrentLocale() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const locale = parts.find((part) => LOCALES.includes(part));
    return locale || 'en';
  }

  function buildLocalizedPath(targetLocale) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const localeIndex = parts.findIndex((part) => LOCALES.includes(part));

    if (localeIndex >= 0) {
      parts[localeIndex] = targetLocale;
      return `/${parts.join('/')}${window.location.pathname.endsWith('/') ? '/' : ''}`;
    }

    if (parts.length === 0) {
      return `/${targetLocale}/`;
    }

    return `/${parts[0]}/${targetLocale}/`;
  }

  function setActiveNavigation() {
    const path = window.location.pathname;
    const currentFile = path.endsWith('/') ? 'index.html' : path.split('/').pop();
    const navLinks = document.querySelectorAll('[data-nav-link]');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const normalizedHref = href.endsWith('/') ? 'index.html' : href.split('/').pop();
      if (normalizedHref === currentFile) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initLanguageSwitch() {
    const locale = getCurrentLocale();
    const targetLocale = locale === 'ko' ? 'en' : 'ko';
    const link = document.querySelector('[data-lang-switch]');
    if (!link) {
      return;
    }

    link.href = buildLocalizedPath(targetLocale);
    link.textContent = locale === 'ko' ? 'English' : '한국어';
    link.setAttribute('lang', targetLocale);
  }

  function initMobileNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open', !expanded);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      });
    });
  }

  function setCurrentYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-current-year]').forEach((node) => {
      node.textContent = year;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNavigation();
    initLanguageSwitch();
    initMobileNavigation();
    setCurrentYear();
  });
})();
