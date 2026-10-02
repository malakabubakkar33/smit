import React, { useState, useEffect } from 'react';
import { getMediaUrl } from '../../utils/media.js';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state whenever src changes (e.g. user just uploaded a new avatar)
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const resolvedSrc = getMediaUrl(src);

  if (resolvedSrc && !imageError) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizes[size]} rounded-2xl object-cover ring-2 ring-white shadow-sm flex-shrink-0 ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-bold flex items-center justify-center ring-2 ring-white shadow-sm flex-shrink-0 select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

