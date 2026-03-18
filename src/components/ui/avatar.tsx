'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: keyof typeof sizes;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function stringToColor(str: string): string {
  const colors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-sky-500',
    'bg-violet-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({
  className,
  src,
  alt = '',
  name = '',
  size = 'md',
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !src || imgError;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        sizes[size],
        showFallback && (name ? stringToColor(name) : 'bg-gray-200 dark:bg-gray-700'),
        className
      )}
      role="img"
      aria-label={alt || name || 'avatar'}
      {...props}
    >
      {!showFallback ? (
        <img
          src={src!}
          alt={alt || name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-medium text-white select-none">
          {name ? getInitials(name) : '?'}
        </span>
      )}
    </div>
  );
}

Avatar.displayName = 'Avatar';

export { Avatar };
