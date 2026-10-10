import { Star } from 'lucide-react';

export default function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted" aria-label={`Rated ${value} out of 5`}>
      <Star size={13} className="fill-yellow text-ink" strokeWidth={1.5} />
      <span className="font-semibold text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span>({count})</span>}
    </span>
  );
}
