export function PageSectionNav({ activeId, ariaLabel, items, onChange, className = '' }) {
  return (
    <nav aria-label={ariaLabel} className={`page-section-nav ${className}`.trim()}>
      {items.map((item) => (
        <button
          aria-pressed={activeId === item.id}
          className="page-section-tab"
          key={item.id}
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
