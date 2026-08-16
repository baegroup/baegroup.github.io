import { ArrowUpRight } from 'lucide-react';

export function ExternalLinkIcon({ className = '' }) {
  return (
    <ArrowUpRight
      aria-hidden="true"
      className={`ml-1 inline size-3.5 shrink-0 align-[-0.125em] ${className}`}
      strokeWidth={1.6}
    />
  );
}
