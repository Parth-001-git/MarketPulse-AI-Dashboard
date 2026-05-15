'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { CandlePoint } from '@/types/market';
import { formatPrice, formatDateShort, formatDateFull, formatPct } from '@/lib/formatters';
import { CustomTooltip } from './CustomTooltip';

interface PriceChartProps {
  candles: CandlePoint[];
  color?: string;
  showMA?: boolean;
  height?: number;
}

export function PriceChart({
  candles,
  color = '#3b82f6',
  showMA = true,
  height = 260,
}: PriceChartProps) {
  const data = candles.map((c) => ({
    ...c,
    dateLabel: formatDateShort(c.date),
    fullDate: formatDateFull(c.date),
  }));

  const minClose = Math.min(...candles.map((c) => c.close));
  const maxClose = Math.max(...candles.map((c) => c.close));
  const padding = (maxClose - minClose) * 0.08;

  const gradientId = `price-gradient-${color.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />

        <XAxis
          dataKey="dateLabel"
          tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          domain={[minClose - padding, maxClose + padding]}
          tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter, monospace' }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v) => formatPrice(v, v > 1000 ? 0 : 2)}
        />

        <Tooltip
          content={<CustomTooltip color={color} />}
          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
        />

        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#0f1420' }}
          name="Price"
        />

        {showMA && (
          <Area
            type="monotone"
            dataKey="ma7"
            stroke="rgba(251,191,36,0.7)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill="none"
            dot={false}
            activeDot={false}
            name="MA(7)"
          />
        )}

        {showMA && <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8', paddingTop: 8 }} />}
      </AreaChart>
    </ResponsiveContainer>
  );
}
