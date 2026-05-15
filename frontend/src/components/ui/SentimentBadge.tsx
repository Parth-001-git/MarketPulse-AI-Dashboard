'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Trend } from '@/types/insights';

interface SentimentBadgeProps {
  sentiment: Trend;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const config: Record<Trend, { label: string; classes: string; Icon: React.ElementType }> = {
  bullish: {
    label: 'BULLISH',
    classes: 'bg-accent-green/10 text-accent-green border-accent-green/25',
    Icon: TrendingUp,
  },
  bearish: {
    label: 'BEARISH',
    classes: 'bg-accent-red/10 text-accent-red border-accent-red/25',
    Icon: TrendingDown,
  },
  neutral: {
    label: 'NEUTRAL',
    classes: 'bg-surface-3 text-text-secondary border-surface-4',
    Icon: Minus,
  },
};

export function SentimentBadge({ sentiment, size = 'sm', pulse = false }: SentimentBadgeProps) {
  const { label, classes, Icon } = config[sentiment];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wider',
        classes,
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      )}
    >
      <Icon className={clsx('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {label}
      {pulse && sentiment !== 'neutral' && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={clsx(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              sentiment === 'bullish' ? 'bg-accent-green' : 'bg-accent-red'
            )}
          />
          <span
            className={clsx(
              'relative inline-flex h-1.5 w-1.5 rounded-full',
              sentiment === 'bullish' ? 'bg-accent-green' : 'bg-accent-red'
            )}
          />
        </span>
      )}
    </span>
  );
}

interface TrendPillProps {
  label: string;
  value: string;
  sentiment?: Trend;
}

export function TrendPill({ label, value, sentiment = 'neutral' }: TrendPillProps) {
  const colorMap: Record<Trend, string> = {
    bullish: 'text-accent-green',
    bearish: 'text-accent-red',
    neutral: 'text-text-secondary',
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={clsx('font-mono text-xs font-semibold', colorMap[sentiment])}>{value}</span>
    </div>
  );
}
