import { useEffect, useRef, useState } from 'react';

const OBSERVER_OPTIONS = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px'
};

export function useScrollReveal(delay = 0) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === 'undefined') {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(entry.target);
        }
      });
    }, OBSERVER_OPTIONS);

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    revealClassName: revealed ? 'reveal-section is-visible' : 'reveal-section',
    revealStyle: { transitionDelay: `${delay}ms` }
  };
}
