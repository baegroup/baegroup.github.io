import { Link } from 'react-router-dom';

export function PageSectionNav({ activeId, ariaLabel, items, onChange, className = '' }) {
  return (
    <nav aria-label={ariaLabel} className={`page-section-nav ${className}`.trim()}>
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
  );
}
