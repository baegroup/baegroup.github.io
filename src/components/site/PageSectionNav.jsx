import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function PageSectionNav({ activeId, ariaLabel, items, onChange, className = '', mobileOverflowCue = false }) {
  const navRef = useRef(null);
  const [overflowEdges, setOverflowEdges] = useState({ left: false, right: false });

  useEffect(() => {
    if (!mobileOverflowCue) {
      return undefined;
    }

    const nav = navRef.current;
    if (!nav) {
      return undefined;
    }

    let frame = 0;
    const updateOverflowEdges = () => {
      const maxScrollLeft = Math.max(0, nav.scrollWidth - nav.clientWidth);
      setOverflowEdges({
        left: nav.scrollLeft > 2,
        right: nav.scrollLeft < maxScrollLeft - 2
      });
    };

    const alignActiveItem = () => {
      if (!window.matchMedia('(max-width: 639px)').matches) {
        nav.scrollLeft = 0;
        updateOverflowEdges();
        return;
      }

      const activeItem = nav.querySelector('[aria-current="page"], [aria-pressed="true"], [data-state="active"]');
      if (activeItem) {
        const targetScrollLeft = Math.max(0, activeItem.offsetLeft - (nav.clientWidth - activeItem.clientWidth) / 2);
        if (typeof nav.scrollTo === 'function') {
          nav.scrollTo({ left: targetScrollLeft, behavior: 'auto' });
        } else {
          nav.scrollLeft = targetScrollLeft;
        }
      }
      updateOverflowEdges();
    };

    frame = window.requestAnimationFrame(alignActiveItem);
    nav.addEventListener('scroll', updateOverflowEdges, { passive: true });

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateOverflowEdges);
    resizeObserver?.observe(nav);

    return () => {
      window.cancelAnimationFrame(frame);
      nav.removeEventListener('scroll', updateOverflowEdges);
      resizeObserver?.disconnect();
    };
  }, [activeId, items.length, mobileOverflowCue]);

  const shellClassName = [
    'page-section-nav-shell',
    mobileOverflowCue ? 'is-mobile-scroll-cued' : '',
    overflowEdges.left ? 'has-overflow-left' : '',
    overflowEdges.right ? 'has-overflow-right' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClassName}>
      <nav aria-label={ariaLabel} className={`page-section-nav ${className}`.trim()} ref={navRef}>
        {items.map((item) => {
          const active = activeId === item.id;
          if (item.to) {
            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className="page-section-tab no-underline"
                key={item.id}
                to={item.to}
              >
                {item.label}
              </Link>
            );
          }

          return (
            <button
              aria-pressed={active}
              className="page-section-tab"
              key={item.id}
              onClick={() => onChange?.(item.id)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
