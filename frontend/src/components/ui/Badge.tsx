'use client';

import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'positive' | 'negative' | 'neutral' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantMap = {
    positive: 'bg-accent-green/10 text-accent-green border-accent-green/20',
    negative: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    neutral: 'bg-surface-3 text-text-secondary border-surface-3',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  };

  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        variantMap[variant],
        sizeMap[size]
      )}
    >
      {children}
    </span>
  );
}

/** Animated live indicator dot */
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-green/20 bg-accent-green/10 px-2 py-0.5 text-xs font-medium text-accent-green">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-green" />
      </span>
      LIVE
    </span>
  );
}
