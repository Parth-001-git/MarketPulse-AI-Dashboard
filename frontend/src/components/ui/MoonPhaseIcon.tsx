'use client';

import React from 'react';
import type { MoonPhaseName, MOON_EMOJI } from '@/types/cycles';
import { MOON_EMOJI as EMOJI_MAP } from '@/types/cycles';
import { clsx } from 'clsx';

interface MoonPhaseIconProps {
  phase: MoonPhaseName;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  illumination?: number;
  className?: string;
}

const SIZE_MAP = {
  xs: 'text-base leading-none',
  sm: 'text-xl leading-none',
  md: 'text-2xl leading-none',
  lg: 'text-4xl leading-none',
} as const;

const LABEL_SIZE = {
  xs: 'text-[9px]',
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const;

/** Renders a moon phase emoji with optional label and illumination bar */
export function MoonPhaseIcon({
  phase,
  size = 'sm',
  showLabel = false,
  illumination,
  className,
}: MoonPhaseIconProps) {
  const emoji = EMOJI_MAP[phase];

  return (
    <span className={clsx('inline-flex flex-col items-center gap-0.5', className)}>
      <span className={SIZE_MAP[size]} role="img" aria-label={phase}>
        {emoji}
      </span>
      {showLabel && (
        <span className={clsx('text-text-muted font-medium', LABEL_SIZE[size])}>
          {phase}
        </span>
      )}
      {illumination !== undefined && (
        <span className={clsx('font-mono text-text-muted', LABEL_SIZE[size])}>
          {illumination.toFixed(0)}%
        </span>
      )}
    </span>
  );
}

/** Compact phase pill for timelines and tooltips */
export function MoonPhasePill({ phase, illumination }: { phase: MoonPhaseName; illumination?: number }) {
  const isMajor = phase === 'New Moon' || phase === 'Full Moon';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold border',
        isMajor
          ? 'border-accent-yellow/30 bg-accent-yellow/10 text-accent-yellow'
          : 'border-surface-3 bg-surface-2 text-text-muted'
      )}
    >
      <span>{EMOJI_MAP[phase]}</span>
      <span>{phase}</span>
      {illumination !== undefined && (
        <span className="opacity-70">{illumination.toFixed(0)}%</span>
      )}
    </span>
  );
}
