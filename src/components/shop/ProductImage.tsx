import { useState } from 'react';

// Falls back to a typographic tile when a remote image fails.
export default function ProductImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`grid place-items-center bg-yellow-soft font-display text-4xl font-semibold text-ink/30 ${className}`} aria-label={alt}>
        {alt.slice(0, 1)}
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`bg-cream object-cover ${className}`} />;
}
