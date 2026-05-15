/**
 * TypeScript types for Phase 3 — Cyclical Signal Analysis.
 * Mirror the backend Pydantic schemas in cycle_schemas.py exactly.
 */

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export const MOON_EMOJI: Record<MoonPhaseName, string> = {
  'New Moon':        '🌑',
  'Waxing Crescent': '🌒',
  'First Quarter':   '🌓',
  'Waxing Gibbous':  '🌔',
  'Full Moon':       '🌕',
  'Waning Gibbous':  '🌖',
  'Last Quarter':    '🌗',
  'Waning Crescent': '🌘',
};

export const MAJOR_PHASES = new Set<MoonPhaseName>(['New Moon', 'Full Moon']);

export interface MoonPhasePoint {
  date: string;
  illumination: number;   // 0–100 %
  phase: MoonPhaseName;
  waxing: boolean;
  strength: number;       // 0–1 significance
  is_major: boolean;
}

export interface MoonCycleResponse {
  data: MoonPhasePoint[];
  period_start: string;
  period_end: string;
  total_points: number;
}

export interface RetrogradeWindow {
  planet: string;
  start: string;
  end: string;
  active: boolean;
}

export interface RetrogradeResponse {
  windows: RetrogradeWindow[];
  period_start: string;
  period_end: string;
}

/** One trading day with full cyclical metadata attached */
export interface OverlayPoint {
  date: string;
  close: number;
  pct_change: number;
  volatility: number;
  volume: number;
  moon_phase: MoonPhaseName;
  moon_illumination: number;
  moon_strength: number;
  is_major_moon_event: boolean;
  mercury_retrograde: boolean;
  volatility_spike: boolean;
  spike_intensity: number;    // z-score vs 30d mean
}

export interface SignalOverlayMeta {
  ticker: string;
  period: string;
  data_points: number;
  spike_threshold: number;
  retrograde_windows: number;
  major_moon_events: number;
  fetched_at: string;
}

export interface SignalOverlayResponse {
  data: OverlayPoint[];
  retrograde_windows: RetrogradeWindow[];
  meta: SignalOverlayMeta;
}
