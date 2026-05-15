/**
 * TypeScript types for Phase 2 — AI Insight layer.
 */

export type Trend = 'bullish' | 'bearish' | 'neutral';
export type Momentum = 'accelerating' | 'decelerating' | 'stable';
export type MAPosition = 'above' | 'below';
export type CommentarySource = 'openai' | 'rule_engine';

export interface InsightResponse {
  ticker: string;
  price: number;
  daily_change: number;
  volatility: number;
  volatility_shift: number;
  trend: Trend;
  momentum: Momentum;
  ma_position: MAPosition;
  sentiment: Trend;
  positive_day_rate: number;
  price_range_30d: number;
  ma7: number;
  high_30d: number;
  low_30d: number;
  ai_commentary: string;
  commentary_source: CommentarySource;
  as_of: string;
}
