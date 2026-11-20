import React, { useState } from 'react';
import logoImg from '../assets/logo.jpg';
import { LOGO_DATA_URI } from '../assets/logoData';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "w-full h-full object-cover",
  alt = "Vedabhyas"
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(logoImg || LOGO_DATA_URI);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white font-bold select-none ${className}`}
        title={alt}
      >
        <span className="font-serif text-amber-300 font-extrabold text-lg sm:text-xl tracking-tight">
          वै
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="eager"
      onError={() => {
        if (currentSrc !== LOGO_DATA_URI) {
          // Immediately try the embedded Base64 data URI
          setCurrentSrc(LOGO_DATA_URI);
        } else {
          // Fall back to the SVG glyph
          setHasError(true);
        }
      }}
    />
  );
};
