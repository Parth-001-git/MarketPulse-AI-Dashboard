'use client';

import React from 'react';
import { formatPrice, formatDateFull, formatPct } from '@/lib/formatters';

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  color?: string;
}

export function CustomTooltip({ active, payload, label, color = '#3b82f6' }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const priceItem = payload.find((p) => p.name === 'Price');
  const maItem = payload.find((p) => p.name === 'MA(7)');

  // Find the pct_change from the data (it's not in the chart series but on the data point)
  const rawData = (payload[0] as any)?.payload;

  return (
    <div className="rounded-lg border border-surface-3 bg-surface-1 p-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-xs font-semibold text-text-secondary">
        {rawData?.fullDate ?? label}
      </p>

      {priceItem && (
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-text-muted">Price</span>
          <span className="font-mono text-sm font-semibold" style={{ color }}>
            {formatPrice(priceItem.value, priceItem.value > 1000 ? 2 : 4)}
          </span>
        </div>
      )}

      {maItem && (
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-text-muted">MA(7)</span>
          <span className="font-mono text-sm text-yellow-400">
            {formatPrice(maItem.value, maItem.value > 1000 ? 2 : 4)}
          </span>
        </div>
      )}

      {rawData?.pct_change !== undefined && (
        <div className="mt-1.5 flex items-center justify-between gap-6 border-t border-surface-3 pt-1.5">
          <span className="text-xs text-text-muted">Change</span>
          <span
            className={`font-mono text-xs font-medium ${
              rawData.pct_change >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {formatPct(rawData.pct_change)}
          </span>
        </div>
      )}

      {rawData?.volatility !== undefined && rawData.volatility > 0 && (
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-text-muted">Volatility</span>
          <span className="font-mono text-xs text-text-secondary">
            {rawData.volatility.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
