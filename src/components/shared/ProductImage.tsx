import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

/** Falls back to a neutral placeholder glyph if a product image fails to load, instead of
 *  showing the browser's broken-image icon. */
export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-surface-muted ${className}`} role="img" aria-label={alt}>
        <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" className="text-muted">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
          <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}
