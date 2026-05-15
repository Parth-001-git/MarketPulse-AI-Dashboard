'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { fetchStockData } from '@/lib/api';
import { MarketDataResponse, AsyncState } from '@/types/market';
import { formatPrice, formatPct, formatVolume } from '@/lib/formatters';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { LiveBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriceChart } from '@/components/charts/PriceChart';

const SUPPORTED_TICKERS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'META'] as const;

export function StockSection() {
  const [ticker, setTicker] = useState<string>('AAPL');
  const [state, setState] = useState<AsyncState<MarketDataResponse>>({ status: 'idle' });

  const load = useCallback(async (t: string) => {
    setState({ status: 'loading' });
    try {
      const data = await fetchStockData(t);
      setState({ status: 'success', data });
    } catch (err: any) {
      setState({ status: 'error', message: err?.detail ?? err?.message ?? 'Failed to load stock data' });
    }
  }, []);

  useEffect(() => { load(ticker); }, [load, ticker]);

  const handleTickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTicker(e.target.value);
  };

  const tickerSelector = (
    <div className="relative">
      <select
        value={ticker}
        onChange={handleTickerChange}
        className="appearance-none rounded-lg border border-surface-3 bg-surface-2 py-1 pl-3 pr-7 text-xs font-medium text-text-primary transition-colors hover:border-accent-blue/30 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
      >
        {SUPPORTED_TICKERS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
    </div>
  );

  if (state.status === 'idle' || state.status === 'loading') return <CardSkeleton />;
  if (state.status === 'error')
    return (
      <Card>
        <CardHeader
          title="Stock Market"
          icon={<TrendingUp className="h-4 w-4 text-accent-blue" />}
          badge={tickerSelector}
        />
        <ErrorState message={state.message} onRetry={() => load(ticker)} />
      </Card>
    );

  const { summary, candles } = state.data;
  const isPositive = summary.daily_change_pct >= 0;

  return (
    <Card glowColor={isPositive ? 'green' : 'red'} className="animate-slide-up">
      <CardHeader
        title={`${ticker} — Stock`}
        subtitle="Equities · 30-day history"
        icon={<TrendingUp className="h-4 w-4 text-accent-blue" />}
        badge={tickerSelector}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Latest Price" value={summary.latest_close} format="price" size="md" />
        <StatCard
          label="24h Change"
          value={formatPct(summary.daily_change_pct)}
          change={summary.daily_change_pct}
          size="md"
        />
        <StatCard label="MA(7)" value={summary.ma7} format="price" size="md" />
        <StatCard label="30d Volatility" value={`${summary.volatility_30d.toFixed(1)}%`} size="md" />
      </div>

      <div className="rounded-lg bg-surface-0 p-3">
        <PriceChart candles={candles} color="#3b82f6" showMA height={260} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-surface-3 pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wider text-text-muted">30d High</span>
          <span className="font-mono text-sm font-semibold text-accent-green">
            {formatPrice(summary.high_30d)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wider text-text-muted">30d Low</span>
          <span className="font-mono text-sm font-semibold text-accent-red">
            {formatPrice(summary.low_30d)}
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
