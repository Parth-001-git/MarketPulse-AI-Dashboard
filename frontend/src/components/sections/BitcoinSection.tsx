'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bitcoin, RefreshCw } from 'lucide-react';
import { fetchBtcData } from '@/lib/api';
import { MarketDataResponse, AsyncState } from '@/types/market';
import { formatPrice, formatPct, formatVolume, signColor } from '@/lib/formatters';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, LiveBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriceChart } from '@/components/charts/PriceChart';

export function BitcoinSection() {
  const [state, setState] = useState<AsyncState<MarketDataResponse>>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchBtcData();
      setState({ status: 'success', data });
    } catch (err: any) {
      setState({ status: 'error', message: err?.detail ?? err?.message ?? 'Failed to load BTC data' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (state.status === 'idle' || state.status === 'loading') return <CardSkeleton />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={load} />;

  const { summary, candles } = state.data;
  const isPositive = summary.daily_change_pct >= 0;

  return (
    <Card glowColor={isPositive ? 'green' : 'red'} className="animate-slide-up">
      <CardHeader
        title="Bitcoin"
        subtitle="BTC-USD · 30-day history"
        icon={<Bitcoin className="h-4 w-4 text-accent-yellow" />}
        badge={<LiveBadge />}
      />

      {/* Key stats row */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Latest Price"
          value={summary.latest_close}
          format="price"
          size="md"
        />
        <StatCard
          label="24h Change"
          value={formatPct(summary.daily_change_pct)}
          change={summary.daily_change_pct}
          size="md"
        />
        <StatCard
          label="MA(7)"
          value={summary.ma7}
          format="price"
          size="md"
        />
        <StatCard
          label="30d Volatility"
          value={`${summary.volatility_30d.toFixed(1)}%`}
          size="md"
        />
      </div>

      {/* Chart */}
      <div className="rounded-lg bg-surface-0 p-3">
        <PriceChart candles={candles} color="#f59e0b" showMA height={260} />
      </div>

      {/* Range row */}
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-surface-3 pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wider text-text-muted">30d High</span>
          <span className="font-mono text-sm font-semibold text-accent-green">
            {formatPrice(summary.high_30d, 0)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wider text-text-muted">30d Low</span>
          <span className="font-mono text-sm font-semibold text-accent-red">
            {formatPrice(summary.low_30d, 0)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wider text-text-muted">Avg Volume</span>
          <span className="font-mono text-sm font-semibold text-text-secondary">
            {formatVolume(summary.avg_volume)}
          </span>
        </div>
      </div>
    </Card>
  );
}
