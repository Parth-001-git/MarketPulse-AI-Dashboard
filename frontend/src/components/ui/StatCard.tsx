'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPrice, formatPct, signColor } from '@/lib/formatters';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;       // percentage change — drives color + icon
  format?: 'price' | 'pct' | 'raw' | 'volume';
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  format = 'raw',
  prefix,
  suffix,
  size = 'md',
  className,
}: StatCardProps) {
  const displayValue =
    typeof value === 'number' && format === 'price'
      ? formatPrice(value, value > 1000 ? 2 : 4)
      : typeof value === 'number' && format === 'pct'
      ? formatPct(value)
      : String(value);

  const sizeMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const TrendIcon =
    change === undefined || change === 0
      ? Minus
      : change > 0
      ? TrendingUp
      : TrendingDown;

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <p className="text-xs font-medium uppercase tracking-widest text-text-muted">{label}</p>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-sm text-text-secondary">{prefix}</span>}
        <span className={clsx('font-mono font-semibold text-text-primary', sizeMap[size])}>
          {displayValue}
        </span>
        {suffix && <span className="text-sm text-text-secondary">{suffix}</span>}
      </div>
      {change !== undefined && (
        <div className={clsx('flex items-center gap-1 text-xs font-medium', signColor(change))}>
          <TrendIcon className="h-3 w-3" />
          <span>{formatPct(change)}</span>
        </div>
      )}
    </div>
  );
}
