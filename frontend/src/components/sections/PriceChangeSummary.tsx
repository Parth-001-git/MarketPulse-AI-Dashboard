'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchBtcData, fetchStockData } from '@/lib/api';
import { MarketSummary } from '@/types/market';
import { formatPrice, formatPct, signColor } from '@/lib/formatters';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface AssetRow {
  name: string;
  ticker: string;
  price: number;
  change: number;
  ma7: number;
  volatility: number;
  type: 'crypto' | 'equity';
}

export function PriceChangeSummary() {
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [btc, aapl, tsla] = await Promise.allSettled([
        fetchBtcData(),
        fetchStockData('AAPL'),
        fetchStockData('TSLA'),
      ]);

      const parsed: AssetRow[] = [];

      const toRow = (
        name: string,
        ticker: string,
        type: 'crypto' | 'equity',
        s: MarketSummary
      ): AssetRow => ({
        name,
        ticker,
        price: s.latest_close,
        change: s.daily_change_pct,
        ma7: s.ma7,
        volatility: s.volatility_30d,
        type,
      });

      if (btc.status === 'fulfilled')
        parsed.push(toRow('Bitcoin', 'BTC-USD', 'crypto', btc.value.summary));
      if (aapl.status === 'fulfilled')
        parsed.push(toRow('Apple', 'AAPL', 'equity', aapl.value.summary));
      if (tsla.status === 'fulfilled')
        parsed.push(toRow('Tesla', 'TSLA', 'equity', tsla.value.summary));

      setRows(parsed);
    } catch {
      setError('Failed to load price summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Card className="animate-slide-up">
      <CardHeader
        title="Price Change Summary"
        subtitle="Side-by-side comparison"
        icon={<BarChart3 className="h-4 w-4 text-accent-purple" />}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-3">
              <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Asset</th>
              <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-text-muted">Price</th>
              <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-text-muted">24h %</th>
              <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-text-muted hidden sm:table-cell">MA(7)</th>
              <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-text-muted hidden md:table-cell">30d Vol.</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-3/50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="py-3 pr-2">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => {
                  const TrendIcon = row.change >= 0 ? TrendingUp : TrendingDown;
                  return (
                    <tr
                      key={row.ticker}
                      className="group border-b border-surface-3/50 transition-colors hover:bg-surface-2/40"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={row.type === 'crypto' ? 'info' : 'neutral'} size="sm">
                            {row.type === 'crypto' ? '₿' : '📈'}
                          </Badge>
                          <div>
                            <p className="font-medium text-text-primary">{row.name}</p>
                            <p className="text-xs text-text-muted">{row.ticker}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono font-semibold text-text-primary">
                        {formatPrice(row.price, row.price > 1000 ? 2 : 4)}
                      </td>
                      <td className={`py-3 text-right font-mono text-xs font-semibold ${signColor(row.change)}`}>
                        <span className="flex items-center justify-end gap-1">
                          <TrendIcon className="h-3 w-3" />
                          {formatPct(row.change)}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-xs text-text-secondary hidden sm:table-cell">
                        {formatPrice(row.ma7, row.ma7 > 1000 ? 2 : 4)}
                      </td>
                      <td className="py-3 text-right font-mono text-xs text-accent-purple hidden md:table-cell">
                        {row.volatility.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {error && (
          <p className="mt-2 text-center text-xs text-accent-red">{error}</p>
        )}
      </div>
    </Card>
  );
}
