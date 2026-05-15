'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, Bot, Cpu, ChevronDown, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import type { InsightResponse } from '@/types/insights';
import { fetchBtcInsight, fetchStockInsight } from '@/lib/api';
import { formatPrice, formatPct } from '@/lib/formatters';
import { SentimentBadge, TrendPill } from '@/components/ui/SentimentBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

const TICKERS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'AMZN'] as const;

// ─── Single Insight Card ────────────────────────────────────────────────────

function InsightCard({ data }: { data: InsightResponse }) {
  const isPositive = data.daily_change >= 0;
  const sourceLabel = data.commentary_source === 'openai' ? 'GPT-4o' : 'Rule Engine';
  const SourceIcon = data.commentary_source === 'openai' ? Sparkles : Cpu;

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border p-5 transition-all duration-300',
        data.sentiment === 'bullish'
          ? 'border-accent-green/20 bg-gradient-to-br from-accent-green/5 to-surface-1'
          : data.sentiment === 'bearish'
          ? 'border-accent-red/20 bg-gradient-to-br from-accent-red/5 to-surface-1'
          : 'border-surface-3 bg-surface-1'
      )}
    >
      {/* Top row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-text-primary">{data.ticker}</span>
            <SentimentBadge sentiment={data.sentiment} pulse />
          </div>
          <p className="mt-0.5 font-mono text-xl font-semibold text-text-primary">
            {formatPrice(data.price, data.price > 1000 ? 2 : 4)}
            <span
              className={clsx(
                'ml-2 text-sm font-medium',
                isPositive ? 'text-accent-green' : 'text-accent-red'
              )}
            >
              {formatPct(data.daily_change)}
            </span>
          </p>
        </div>
        <div
          className={clsx(
            'flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-medium',
            data.commentary_source === 'openai'
              ? 'border-accent-purple/20 bg-accent-purple/10 text-accent-purple'
              : 'border-surface-3 bg-surface-2 text-text-muted'
          )}
        >
          <SourceIcon className="h-3 w-3" />
          {sourceLabel}
        </div>
      </div>

      {/* AI Commentary */}
      <div className="mb-4 rounded-lg border border-surface-3 bg-surface-0 p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 text-accent-cyan" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-cyan">
            AI Commentary
          </span>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{data.ai_commentary}</p>
      </div>

      {/* Signal grid */}
      <div className="grid grid-cols-2 gap-2">
        <TrendPill
          label="Trend"
          value={data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}
          sentiment={data.trend}
        />
        <TrendPill
          label="Momentum"
          value={data.momentum.charAt(0).toUpperCase() + data.momentum.slice(1)}
          sentiment={
            data.momentum === 'accelerating'
              ? data.trend === 'bearish'
                ? 'bearish'
                : 'bullish'
              : data.momentum === 'decelerating'
              ? data.trend === 'bullish'
                ? 'bearish'
                : 'bullish'
              : 'neutral'
          }
        />
        <TrendPill
          label="vs MA(7)"
          value={`Price ${data.ma_position} MA`}
          sentiment={data.ma_position === 'above' ? 'bullish' : 'bearish'}
        />
        <TrendPill
          label="Volatility"
          value={`${data.volatility.toFixed(1)}% ann.`}
          sentiment={data.volatility > 60 ? 'bearish' : data.volatility < 30 ? 'bullish' : 'neutral'}
        />
        <TrendPill
          label="Vol. Shift"
          value={`${data.volatility_shift >= 0 ? '+' : ''}${data.volatility_shift.toFixed(1)}%`}
          sentiment={data.volatility_shift > 3 ? 'bearish' : data.volatility_shift < -2 ? 'bullish' : 'neutral'}
        />
        <TrendPill
          label="Win Rate (30d)"
          value={`${data.positive_day_rate.toFixed(0)}%`}
          sentiment={data.positive_day_rate > 55 ? 'bullish' : data.positive_day_rate < 45 ? 'bearish' : 'neutral'}
        />
      </div>
    </div>
  );
}

// ─── Skeleton for Insight Card ──────────────────────────────────────────────

function InsightCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-surface-3 bg-surface-1 p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      <div className="mb-4 rounded-lg bg-surface-0 p-4">
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="mb-1.5 h-4 w-full" />
        <Skeleton className="mb-1.5 h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Section Component ─────────────────────────────────────────────────

export function AIInsightsSection() {
  const [stockTicker, setStockTicker] = useState('AAPL');
  const [btcState, setBtcState] = useState<AsyncState<InsightResponse>>({ status: 'idle' });
  const [stockState, setStockState] = useState<AsyncState<InsightResponse>>({ status: 'idle' });
  const [loaded, setLoaded] = useState(false);

  const loadAll = useCallback(async (ticker = stockTicker) => {
    setBtcState({ status: 'loading' });
    setStockState({ status: 'loading' });

    const [btcResult, stockResult] = await Promise.allSettled([
      fetchBtcInsight(),
      fetchStockInsight(ticker),
    ]);

    setBtcState(
      btcResult.status === 'fulfilled'
        ? { status: 'success', data: btcResult.value }
        : { status: 'error', message: (btcResult.reason as any)?.detail ?? 'BTC insight failed' }
    );
    setStockState(
      stockResult.status === 'fulfilled'
        ? { status: 'success', data: stockResult.value }
        : { status: 'error', message: (stockResult.reason as any)?.detail ?? 'Stock insight failed' }
    );
    setLoaded(true);
  }, [stockTicker]);

  const handleTickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const t = e.target.value;
    setStockTicker(t);
    if (loaded) loadAll(t);
  };

  return (
    <section>
      {/* Section header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-label mb-0.5">AI Market Insights</h2>
          <p className="text-xs text-text-muted">
            Powered by rule engine · optional OpenAI GPT-4o upgrade
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Stock selector */}
          <div className="relative">
            <select
              value={stockTicker}
              onChange={handleTickerChange}
              className="appearance-none rounded-lg border border-surface-3 bg-surface-2 py-1.5 pl-3 pr-7 text-xs font-medium text-text-primary transition-colors hover:border-accent-blue/30 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
            >
              {TICKERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
          </div>

          {/* Generate / Refresh button */}
          <button
            onClick={() => loadAll()}
            disabled={btcState.status === 'loading'}
            className={clsx(
              'flex items-center gap-2 rounded-lg border px-4 py-1.5 text-xs font-semibold transition-all',
              loaded
                ? 'border-surface-3 bg-surface-2 text-text-secondary hover:border-accent-blue/30 hover:text-text-primary'
                : 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20',
              btcState.status === 'loading' && 'cursor-not-allowed opacity-60'
            )}
          >
            {btcState.status === 'loading' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : loaded ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {btcState.status === 'loading' ? 'Generating…' : loaded ? 'Refresh' : 'Generate Insights'}
          </button>
        </div>
      </div>

      {/* Idle state — prompt to generate */}
      {!loaded && btcState.status === 'idle' && (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-surface-3 bg-surface-1/50 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-cyan/20">
            <Bot className="h-7 w-7 text-accent-cyan" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">AI Insight Engine Ready</p>
            <p className="mt-1 max-w-xs text-xs text-text-muted">
              Click "Generate Insights" to run the market analytics pipeline and produce AI commentary.
            </p>
          </div>
          <button
            onClick={() => loadAll()}
            className="flex items-center gap-2 rounded-lg border border-accent-blue/40 bg-accent-blue/10 px-5 py-2 text-sm font-semibold text-accent-blue transition-all hover:bg-accent-blue/20"
          >
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </button>
        </div>
      )}

      {/* Insight cards */}
      {(loaded || btcState.status === 'loading') && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* BTC */}
          {btcState.status === 'loading' && <InsightCardSkeleton />}
          {btcState.status === 'success' && <InsightCard data={btcState.data} />}
          {btcState.status === 'error' && (
            <ErrorState message={btcState.message} onRetry={() => loadAll()} />
          )}

          {/* Stock */}
          {stockState.status === 'loading' && <InsightCardSkeleton />}
          {stockState.status === 'success' && <InsightCard data={stockState.data} />}
          {stockState.status === 'error' && (
            <ErrorState message={stockState.message} onRetry={() => loadAll()} />
          )}
        </div>
      )}
    </section>
  );
}
