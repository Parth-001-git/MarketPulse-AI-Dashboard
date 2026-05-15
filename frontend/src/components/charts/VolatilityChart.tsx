'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { CandlePoint } from '@/types/market';
import { formatDateShort, formatPct } from '@/lib/formatters';

interface VolatilityChartProps {
  candles: CandlePoint[];
  height?: number;
}

export function VolatilityChart({ candles, height = 160 }: VolatilityChartProps) {
  const data = candles.map((c) => ({
    dateLabel: formatDateShort(c.date),
    volatility: parseFloat(c.volatility.toFixed(2)),
    pct_change: c.pct_change,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barSize={5}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="dateLabel"
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div className="rounded-lg border border-surface-3 bg-surface-1 p-2.5 text-xs shadow-xl">
                <p className="mb-1 text-text-muted">{d.dateLabel}</p>
                <p className="font-mono text-accent-purple">
                  Vol: {d.volatility.toFixed(1)}%
                </p>
                <p
                  className={`font-mono ${
                    d.pct_change >= 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}
                >
                  Day: {formatPct(d.pct_change)}
                </p>
              </div>
            );
          }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="volatility" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.volatility > 50 ? '#ef4444' : entry.volatility > 30 ? '#f59e0b' : '#8b5cf6'}
              opacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
