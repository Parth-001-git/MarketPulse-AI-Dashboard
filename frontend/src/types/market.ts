/**
 * Shared TypeScript types mirroring the backend Pydantic schemas.
 * Single source of truth for the entire frontend data layer.
 */

export interface CandlePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  pct_change: number;
  ma7: number;
  volatility: number;
}

export interface MarketSummary {
  ticker: string;
  latest_close: number;
  daily_change_pct: number;
  ma7: number;
  high_30d: number;
  low_30d: number;
  avg_volume: number;
  volatility_30d: number;
  as_of: string;
}

export interface MarketMeta {
  period: string;
  interval: string;
  data_points: number;
  fetched_at: string;
}

export interface MarketDataResponse {
  summary: MarketSummary;
  candles: CandlePoint[];
  meta: MarketMeta;
}

export interface ApiError {
  error: string;
  detail?: string;
}

/** Discriminated union for async state */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
