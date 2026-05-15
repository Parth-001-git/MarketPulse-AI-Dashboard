/**
 * API abstraction layer.
 * All backend calls go through this module — never fetch directly in components.
 */

import { MarketDataResponse } from '@/types/market';
import { InsightResponse } from '@/types/insights';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7860';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    // Next.js ISR-style: revalidate every 60s in production
    next: { revalidate: 60 },
  } as RequestInit & { next?: { revalidate: number } });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const body = await res.json();
      detail = body?.detail;
    } catch (_) {}
    throw new ApiError(res.status, `HTTP ${res.status}: ${res.statusText}`, detail);
  }

  return res.json() as Promise<T>;
}

// ─── Market Endpoints ──────────────────────────────────────────────────────

export async function fetchBtcData(): Promise<MarketDataResponse> {
  return apiFetch<MarketDataResponse>('/market/btc');
}

export async function fetchStockData(ticker: string): Promise<MarketDataResponse> {
  return apiFetch<MarketDataResponse>(`/market/stock/${ticker.toUpperCase()}`);
}

export async function fetchSupportedTickers(): Promise<{ tickers: string[] }> {
  return apiFetch<{ tickers: string[] }>('/market/tickers');
}

export { ApiError };

// ─── Insight Endpoints (Phase 2) ───────────────────────────────────────────

export async function fetchBtcInsight(): Promise<InsightResponse> {
  return apiFetch<InsightResponse>('/insights/btc');
}

export async function fetchStockInsight(ticker: string): Promise<InsightResponse> {
  return apiFetch<InsightResponse>(`/insights/stock/${ticker.toUpperCase()}`);
}

// ─── Phase 3 — Cyclical Signal Endpoints ──────────────────────────────────────

import type {
  MoonCycleResponse,
  RetrogradeResponse,
  SignalOverlayResponse,
} from '@/types/cycles';

export async function fetchMoonCycle(days = 30): Promise<MoonCycleResponse> {
  return apiFetch<MoonCycleResponse>(`/cycles/moon?days=${days}`);
}

export async function fetchRetrograde(days = 30): Promise<RetrogradeResponse> {
  return apiFetch<RetrogradeResponse>(`/cycles/retrograde?days=${days}`);
}

export async function fetchSignalOverlay(ticker: string): Promise<SignalOverlayResponse> {
  return apiFetch<SignalOverlayResponse>(`/signals/overlay/${ticker.toUpperCase()}`);
}

// ─── Phase 4 — Observability Endpoints ────────────────────────────────────────

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  phases: string[];
  timestamp: number;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}
