'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';
import type { OverlayPoint, RetrogradeWindow, MoonPhaseName } from '@/types/cycles';
import { MOON_EMOJI } from '@/types/cycles';
import { formatPrice, formatPct, formatDateShort, formatDateFull } from '@/lib/formatters';

interface CycleOverlayChartProps {
  data: OverlayPoint[];
  retrogradeWindows: RetrogradeWindow[];
  height?: number;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CycleTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload as OverlayPoint | undefined;
  if (!d) return null;

  const isPositive = d.pct_change >= 0;

  return (
    <div className="min-w-[220px] rounded-xl border border-surface-3 bg-surface-1 p-3 shadow-xl text-xs">
      {/* Date */}
      <p className="mb-2 font-mono font-semibold text-text-primary">{formatDateFull(d.date)}</p>

      {/* Price */}
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-text-muted">Close</span>
        <span className="font-mono font-semibold text-text-primary">
          {formatPrice(d.close, d.close > 1000 ? 2 : 4)}
        </span>
      </div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-text-muted">Daily Move</span>
        <span className={`font-mono font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
          {formatPct(d.pct_change)}
        </span>
      </div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-text-muted">Volatility</span>
        <span className={`font-mono font-semibold ${d.volatility_spike ? 'text-accent-red' : 'text-accent-purple'}`}>
          {d.volatility.toFixed(1)}%
          {d.volatility_spike && (
            <span className="ml-1.5 rounded bg-accent-red/20 px-1 py-0.5 text-[9px] font-bold text-accent-red">
              SPIKE
            </span>
          )}
        </span>
      </div>

      {/* Divider */}
      <div className="mb-2 border-t border-surface-3" />

      {/* Moon */}
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <span className="text-text-muted">Moon Phase</span>
        <span className="flex items-center gap-1 font-medium text-accent-yellow">
          <span>{MOON_EMOJI[d.moon_phase]}</span>
          <span>{d.moon_phase}</span>
        </span>
      </div>
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <span className="text-text-muted">Illumination</span>
        <span className="font-mono text-text-secondary">{d.moon_illumination.toFixed(1)}%</span>
      </div>

      {/* Retrograde */}
      {d.mercury_retrograde && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-accent-orange/20 bg-accent-orange/10 px-2 py-1">
          <span className="text-accent-orange">☿</span>
          <span className="font-semibold text-accent-orange">Mercury Retrograde</span>
        </div>
      )}
    </div>
  );
}

// ─── Custom Moon Dot ──────────────────────────────────────────────────────────

function MoonDot(props: any) {
  const { cx, cy, payload } = props;
  const d = payload as OverlayPoint;
  if (!d.is_major_moon_event) return null;

  const emoji = MOON_EMOJI[d.moon_phase];
  return (
    <text
      x={cx}
      y={cy - 12}
      textAnchor="middle"
      fontSize={14}
      style={{ userSelect: 'none', pointerEvents: 'none' }}
    >
      {emoji}
    </text>
  );
}

// ─── Main Chart ───────────────────────────────────────────────────────────────

export function CycleOverlayChart({
  data,
  retrogradeWindows,
  height = 360,
}: CycleOverlayChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        dateLabel: formatDateShort(d.date),
        // Normalised close for dual-axis readability
        closeNorm: d.close,
      })),
    [data]
  );

  const closePrices = data.map((d) => d.close);
  const minClose = Math.min(...closePrices);
  const maxClose = Math.max(...closePrices);
  const padding   = (maxClose - minClose) * 0.1;

  const maxVol = Math.max(...data.map((d) => d.volatility));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cycle-price-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}  />
          </linearGradient>
          <linearGradient id="cycle-spike-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="cycle-vol-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#8b5cf6" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />

        {/* ── Retrograde windows as shaded areas ── */}
        {retrogradeWindows.map((w) => (
          <ReferenceArea
            key={`retro-${w.start}`}
            x1={formatDateShort(w.start)}
            x2={formatDateShort(w.end)}
            yAxisId="price"
            fill="rgba(249,115,22,0.06)"
            stroke="rgba(249,115,22,0.2)"
            strokeDasharray="4 2"
            label={{
              value: '☿ Retro',
              position: 'insideTop',
              fontSize: 9,
              fill: 'rgba(249,115,22,0.7)',
              fontFamily: 'Inter',
            }}
          />
        ))}

        <XAxis
          dataKey="dateLabel"
          tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        {/* Left axis — price */}
        <YAxis
          yAxisId="price"
          domain={[minClose - padding, maxClose + padding]}
          tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v) => formatPrice(v, v > 1000 ? 0 : 2)}
        />

        {/* Right axis — volatility */}
        <YAxis
          yAxisId="vol"
          orientation="right"
          domain={[0, maxVol * 1.4]}
          tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          width={38}
          tickFormatter={(v) => `${v.toFixed(0)}%`}
        />

        <Tooltip
          content={<CycleTooltip />}
          cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
        />

        {/* ── Volatility bars — coloured by spike status ── */}
        <Bar
          yAxisId="vol"
          dataKey="volatility"
          name="Volatility"
          radius={[2, 2, 0, 0]}
          maxBarSize={8}
          fill="url(#cycle-vol-gradient)"
          // Colour spike bars red
          shape={(props: any) => {
            const { x, y, width, height: barH, payload } = props;
            const fill = (payload as OverlayPoint).volatility_spike
              ? 'url(#cycle-spike-gradient)'
              : 'url(#cycle-vol-gradient)';
            return <rect x={x} y={y} width={width} height={barH} fill={fill} rx={2} />;
          }}
        />

        {/* ── Price area ── */}
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="close"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#cycle-price-gradient)"
          dot={(props: any) => <MoonDot {...props} />}
          activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f1420' }}
          name="Price"
        />

        <Legend
          wrapperStyle={{ fontSize: 10, color: '#94a3b8', paddingTop: 8 }}
          formatter={(value) => {
            if (value === 'Price')      return '─ Price';
            if (value === 'Volatility') return '▮ Volatility (red = spike)';
            return value;
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
