'use client';

import React, { useState, useCallback } from 'react';
import {
  FlaskConical,
  RefreshCw,
  Moon,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Info,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { SignalOverlayResponse, OverlayPoint, RetrogradeWindow, MoonPhaseName } from '@/types/cycles';
import { MOON_EMOJI, MAJOR_PHASES } from '@/types/cycles';
import { fetchSignalOverlay } from '@/lib/api';
import { CycleOverlayChart } from '@/components/charts/CycleOverlayChart';
import { MoonPhaseIcon, MoonPhasePill } from '@/components/ui/MoonPhaseIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card, CardHeader } from '@/components/ui/Card';

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

const OVERLAY_TICKERS = ['BTC', 'AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMZN'] as const;

// ─── Stat Pill ──────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color = 'text-text-secondary',
  icon,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-surface-3 bg-surface-2 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <span className={clsx('flex items-center gap-1.5 font-mono text-base font-semibold', color)}>
        {icon}
        {value}
      </span>
    </div>
  );
}

// ─── Moon Phase Timeline Strip ───────────────────────────────────────────────

function MoonTimeline({ data }: { data: OverlayPoint[] }) {
  // Show every 3rd point to avoid crowding
  const sampled = data.filter((_, i) => i % 3 === 0 || data[i].is_major_moon_event);

  return (
    <div className="mt-4 overflow-x-auto">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Lunar Cycle Strip
      </p>
      <div className="flex min-w-max gap-1 pb-2">
        {data.map((d) => {
          const isMajor = d.is_major_moon_event;
          const isSpike = d.volatility_spike;
          return (
            <div
              key={d.date}
              className="group relative flex flex-col items-center"
              title={`${d.date} · ${d.moon_phase} · ${d.moon_illumination.toFixed(0)}% · Vol: ${d.volatility.toFixed(1)}%`}
            >
              {/* Spike indicator */}
              {isSpike && (
                <div className="mb-0.5 h-1 w-5 rounded-full bg-accent-red/70" />
              )}
              {!isSpike && (
                <div
                  className="mb-0.5 h-1 w-5 rounded-full bg-accent-purple/30"
                  style={{ opacity: d.volatility / 100 }}
                />
              )}

              {/* Moon emoji */}
              <span
                className={clsx(
                  'text-[13px] leading-none transition-transform group-hover:scale-125',
                  isMajor && 'opacity-100',
                  !isMajor && 'opacity-50'
                )}
              >
                {MOON_EMOJI[d.moon_phase as MoonPhaseName]}
              </span>

              {/* Retrograde marker */}
              {d.mercury_retrograde && (
                <span className="mt-0.5 text-[8px] text-accent-orange">☿</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1 w-4 rounded-full bg-accent-red/70" /> Volatility spike
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1 w-4 rounded-full bg-accent-purple/30" /> Normal volatility
        </span>
        <span>🌕 🌑 = Major phase</span>
        <span className="text-accent-orange">☿ = Mercury retrograde</span>
      </div>
    </div>
  );
}

// ─── Retrograde Window Badge ─────────────────────────────────────────────────

function RetroBadge({ window: w }: { window: RetrogradeWindow }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs',
        w.active
          ? 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange'
          : 'border-surface-3 bg-surface-2 text-text-muted'
      )}
    >
      <span className="text-base">☿</span>
      <div>
        <p className="font-semibold">
          {w.planet} Retrograde {w.active && <span className="ml-1 rounded bg-accent-orange/20 px-1 text-[9px] font-bold">ACTIVE</span>}
        </p>
        <p className="text-[10px] opacity-70">
          {w.start} → {w.end}
        </p>
      </div>
    </div>
  );
}

// ─── Correlation Summary ─────────────────────────────────────────────────────

function CorrelationSummary({ data, response }: { data: OverlayPoint[]; response: SignalOverlayResponse }) {
  const spikes = data.filter((d) => d.volatility_spike);
  const spikesNearMoon = spikes.filter((d) => d.moon_strength >= 0.65);
  const spikesInRetro  = spikes.filter((d) => d.mercury_retrograde);
  const totalDays      = data.length;
  const retroDays      = data.filter((d) => d.mercury_retrograde).length;

  // Spike rate during retrograde vs not
  const nonRetroDays    = data.filter((d) => !d.mercury_retrograde);
  const retroSpikePct   = retroDays > 0 ? (spikesInRetro.length  / retroDays * 100) : 0;
  const normalSpikePct  = nonRetroDays.length > 0
    ? (spikes.filter((d) => !d.mercury_retrograde).length / nonRetroDays.length * 100)
    : 0;

  const majorMoonDays    = data.filter((d) => d.is_major_moon_event);
  const spikesNearMajor  = spikes.filter((d) => d.is_major_moon_event);

  return (
    <div className="mt-5 rounded-xl border border-surface-3 bg-surface-2/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <FlaskConical className="h-3.5 w-3.5 text-accent-cyan" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
          Experimental Correlation Surface
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-surface-1 p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Volatility Spikes</p>
          <p className="mt-1 font-mono text-lg font-bold text-accent-red">{spikes.length}</p>
          <p className="text-[10px] text-text-muted">of {totalDays} days</p>
        </div>
        <div className="rounded-lg bg-surface-1 p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Spikes near Major Phase</p>
          <p className="mt-1 font-mono text-lg font-bold text-accent-yellow">{spikesNearMajor.length}</p>
          <p className="text-[10px] text-text-muted">of {spikes.length} spikes</p>
        </div>
        <div className="rounded-lg bg-surface-1 p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Spike rate — Retrograde</p>
          <p className={clsx(
            'mt-1 font-mono text-lg font-bold',
            retroSpikePct > normalSpikePct ? 'text-accent-orange' : 'text-accent-green'
          )}>
            {retroDays > 0 ? `${retroSpikePct.toFixed(0)}%` : 'N/A'}
          </p>
          <p className="text-[10px] text-text-muted">vs {normalSpikePct.toFixed(0)}% normal</p>
        </div>
        <div className="rounded-lg bg-surface-1 p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Major Moon Events</p>
          <p className="mt-1 font-mono text-lg font-bold text-accent-yellow">
            {response.meta.major_moon_events}
          </p>
          <p className="text-[10px] text-text-muted">Full + New moons</p>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-text-muted">
        <span className="font-semibold text-text-secondary">Disclaimer: </span>
        These correlations are observational metadata overlays on a 30-day window.
        No causal relationship is implied. This tool is for pattern exploration only.
      </p>
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────

export function CyclicalSignalSection() {
  const [ticker, setTicker]   = useState<string>('BTC');
  const [state, setState]     = useState<AsyncState<SignalOverlayResponse>>({ status: 'idle' });
  const [loaded, setLoaded]   = useState(false);

  const load = useCallback(async (t = ticker) => {
    setState({ status: 'loading' });
    try {
      const data = await fetchSignalOverlay(t);
      setState({ status: 'success', data });
      setLoaded(true);
    } catch (err: any) {
      setState({
        status: 'error',
        message: err?.detail ?? err?.message ?? 'Signal overlay computation failed',
      });
      setLoaded(true);
    }
  }, [ticker]);

  const handleTickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const t = e.target.value;
    setTicker(t);
    if (loaded) load(t);
  };

  // ── Header controls ──
  const controls = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={ticker}
          onChange={handleTickerChange}
          className="appearance-none rounded-lg border border-surface-3 bg-surface-2 py-1.5 pl-3 pr-7 text-xs font-medium text-text-primary transition-colors hover:border-accent-blue/30 focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
        >
          {OVERLAY_TICKERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
      </div>
      <button
        onClick={() => load()}
        disabled={state.status === 'loading'}
        className={clsx(
          'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
          loaded
            ? 'border-surface-3 bg-surface-2 text-text-secondary hover:border-accent-blue/30 hover:text-text-primary'
            : 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20',
          state.status === 'loading' && 'cursor-not-allowed opacity-60'
        )}
      >
        {state.status === 'loading' ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : loaded ? (
          <RefreshCw className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
        {state.status === 'loading' ? 'Computing…' : loaded ? 'Refresh' : 'Run Analysis'}
      </button>
    </div>
  );

  return (
    <section className="animate-slide-up">
      {/* Section header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="section-label mb-0">Cyclical Signal Analysis</h2>
            <span className="rounded-full border border-accent-cyan/20 bg-accent-cyan/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-accent-cyan">
              Experimental · Phase 3
            </span>
          </div>
          <p className="max-w-lg text-xs text-text-muted">
            Overlays astronomical cycle metadata (moon phases, Mercury retrograde) against market
            volatility and price behavior. Curiosity-driven pattern exploration — not prediction.
          </p>
        </div>
        {controls}
      </div>

      {/* ── Idle state ── */}
      {!loaded && state.status === 'idle' && (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-surface-3 bg-surface-1/50 p-10 text-center">
          {/* Animated moon stack */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-cyan/20 via-accent-blue/10 to-transparent">
              <span className="text-4xl">🌕</span>
            </div>
            <span className="absolute -right-2 -top-2 text-xl">☿</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Cyclical Signal Engine Ready</p>
            <p className="mt-1 max-w-sm text-xs text-text-muted">
              Merge 30-day market data with moon phase metadata and retrograde windows
              to explore behavioral patterns.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 text-[10px]">
            {[
              { label: 'Moon Phase Overlay', icon: '🌒' },
              { label: 'Volatility Spikes', icon: '⚡' },
              { label: 'Retrograde Windows', icon: '☿' },
              { label: 'Correlation Surface', icon: '📊' },
            ].map(({ label, icon }) => (
              <span
                key={label}
                className="flex items-center gap-1 rounded-full border border-surface-3 bg-surface-2 px-2.5 py-1 font-medium text-text-secondary"
              >
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>

          <button
            onClick={() => load()}
            className="flex items-center gap-2 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-5 py-2 text-sm font-semibold text-accent-cyan transition-all hover:bg-accent-cyan/20"
          >
            <Moon className="h-4 w-4" />
            Run Cyclical Analysis
          </button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {state.status === 'loading' && (
        <Card animate={false}>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[360px] rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </Card>
      )}

      {/* ── Error ── */}
      {state.status === 'error' && (
        <ErrorState message={state.message} onRetry={() => load()} />
      )}

      {/* ── Success ── */}
      {state.status === 'success' && (() => {
        const { data, retrograde_windows: retroWindows, meta } = state.data;

        const currentMoon = data[data.length - 1];
        const spikeDays   = data.filter((d) => d.volatility_spike);
        const retroActive = retroWindows.some((w) => w.active);

        return (
          <Card animate={false}>
            {/* Card header */}
            <CardHeader
              title="Cyclical Signal Overlay"
              subtitle={`${meta.ticker} · ${meta.period} · ${meta.data_points} trading days`}
              icon={<Moon className="h-4 w-4 text-accent-cyan" />}
              badge={
                <span className="flex items-center gap-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold text-accent-cyan">
                  <FlaskConical className="h-2.5 w-2.5" />
                  EXPERIMENTAL
                </span>
              }
            />

            {/* ── KPI row ── */}
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill
                label="Current Moon"
                value={`${MOON_EMOJI[currentMoon.moon_phase as MoonPhaseName]} ${currentMoon.moon_phase}`}
                color="text-accent-yellow"
              />
              <StatPill
                label="Illumination"
                value={`${currentMoon.moon_illumination.toFixed(1)}%`}
                color="text-accent-yellow"
              />
              <StatPill
                label="Volatility Spikes"
                value={spikeDays.length.toString()}
                color={spikeDays.length > 3 ? 'text-accent-red' : 'text-accent-green'}
                icon={<Zap className="h-3.5 w-3.5" />}
              />
              <StatPill
                label="☿ Retrograde"
                value={retroActive ? 'ACTIVE' : retroWindows.length > 0 ? `${retroWindows.length} window${retroWindows.length > 1 ? 's' : ''}` : 'None'}
                color={retroActive ? 'text-accent-orange' : 'text-text-secondary'}
              />
            </div>

            {/* ── Retrograde windows ── */}
            {retroWindows.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {retroWindows.map((w) => (
                  <RetroBadge key={`${w.start}-${w.end}`} window={w} />
                ))}
              </div>
            )}

            {/* ── Main overlay chart ── */}
            <div className="rounded-lg bg-surface-0 p-3">
              <CycleOverlayChart
                data={data}
                retrogradeWindows={retroWindows}
                height={380}
              />
            </div>

            {/* ── Moon phase timeline strip ── */}
            <MoonTimeline data={data} />

            {/* ── Correlation summary panel ── */}
            <CorrelationSummary data={data} response={state.data} />

            {/* ── Disclaimer banner ── */}
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-surface-3 bg-surface-2/40 p-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
              <p className="text-[10px] leading-relaxed text-text-muted">
                <span className="font-semibold text-text-secondary">Experimental intelligence layer. </span>
                Moon phase and retrograde data are astronomical facts, not predictions.
                Market correlations shown here are observational only.
                No buy/sell signals are generated. Past cyclical patterns do not predict future market behavior.
              </p>
            </div>
          </Card>
        );
      })()}
    </section>
  );
}
