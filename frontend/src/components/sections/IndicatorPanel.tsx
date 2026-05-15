'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { fetchBtcData } from '@/lib/api';
import { CandlePoint, AsyncState, MarketDataResponse } from '@/types/market';
import { formatPrice, formatPct } from '@/lib/formatters';
import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { VolatilityChart } from '@/components/charts/VolatilityChart';

interface Indicator {
  label: string;
  value: string;
  description: string;
  color: string;
}

function buildIndicators(candles: CandlePoint[]): Indicator[] {
  if (!candles.length) return [];
  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2] ?? latest;

  const closes = candles.map((c) => c.close);
  const ma7 = latest.ma7;
  const above = latest.close > ma7;

  const allVolatilities = candles.map((c) => c.volatility).filter((v) => v > 0);
  const avgVolatility = allVolatilities.reduce((a, b) => a + b, 0) / (allVolatilities.length || 1);

  const positiveDays = candles.filter((c) => c.pct_change > 0).length;
  const winRate = ((positiveDays / candles.length) * 100).toFixed(0);

  return [
    {
      label: 'Latest Close',
      value: formatPrice(latest.close, latest.close > 1000 ? 2 : 4),
      description: `vs prev ${formatPrice(prev.close, prev.close > 1000 ? 2 : 4)}`,
      color: 'text-accent-cyan',
    },
    {
      label: 'Daily Change',
      value: formatPct(latest.pct_change),
      description: latest.pct_change >= 0 ? 'Bullish session' : 'Bearish session',
      color: latest.pct_change >= 0 ? 'text-accent-green' : 'text-accent-red',
    },
    {
      label: '7-Day MA',
      value: formatPrice(ma7, ma7 > 1000 ? 2 : 4),
      description: above ? 'Price above MA — bullish bias' : 'Price below MA — bearish bias',
      color: 'text-yellow-400',
    },
    {
      label: '30d Volatility',
      value: `${candles[candles.length - 1].volatility.toFixed(1)}%`,
      description:
        avgVolatility > 50
          ? 'High risk environment'
          : avgVolatility > 30
          ? 'Moderate volatility'
          : 'Low volatility regime',
      color: 'text-accent-purple',
    },
    {
      label: 'Positive Days',
      value: `${winRate}%`,
      description: `${positiveDays} of ${candles.length} sessions`,
      color: 'text-accent-orange',
    },
    {
      label: 'Price Range',
      value: `${(((Math.max(...closes) - Math.min(...closes)) / Math.min(...closes)) * 100).toFixed(1)}%`,
      description: '30-day price swing',
      color: 'text-accent-blue',
    },
  ];
}

export function IndicatorPanel() {
  const [state, setState] = useState<AsyncState<MarketDataResponse>>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchBtcData();
      setState({ status: 'success', data });
    } catch (err: any) {
      setState({ status: 'error', message: err?.message ?? 'Failed to load indicators' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Card className="animate-slide-up">
      <CardHeader
        title="Indicator Panel"
        subtitle="BTC-USD · Technical metrics"
        icon={<Activity className="h-4 w-4 text-accent-cyan" />}
      />

      {(state.status === 'idle' || state.status === 'loading') && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-surface-2 p-3 animate-pulse">
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-1 h-3 w-32" />
            </div>
          ))}
        </div>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={load} />}

      {state.status === 'success' && (() => {
        const indicators = buildIndicators(state.data.candles);
        return (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {indicators.map((ind) => (
                <div
                  key={ind.label}
                  className="rounded-lg bg-surface-2 p-3 transition-colors hover:bg-surface-3"
                >
                  <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">{ind.label}</p>
                  <p className={`font-mono text-base font-semibold ${ind.color}`}>{ind.value}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{ind.description}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                Rolling Volatility (BTC)
              </p>
              <div className="rounded-lg bg-surface-0 p-3">
                <VolatilityChart candles={state.data.candles} height={160} />
              </div>
            </div>
          </>
        );
      })()}
    </Card>
  );
}
