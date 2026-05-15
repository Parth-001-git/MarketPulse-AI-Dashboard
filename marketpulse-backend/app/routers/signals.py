"""
Signals router — Phase 3.
Endpoint:
  GET /signals/overlay/{ticker}

Merges 30-day market OHLCV + indicators with cyclical metadata (moon phases,
Mercury retrograde windows) and annotates volatility spikes.

This is an EXPERIMENTAL intelligence overlay — not a trading signal generator.
"""

from fastapi import APIRouter, HTTPException, Path, Query
from datetime import datetime, timedelta, timezone

from app.services.market_service import market_service
from app.services.cycle_service import get_moon_phases, get_retrograde_windows, build_overlay
from app.schemas.cycle_schemas import SignalOverlayResponse

router = APIRouter()

ALLOWED_TICKERS = {
    "AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "AMD",
    "NFLX", "BABA", "JPM", "GS", "V", "MA", "COIN",
}


@router.get(
    "/overlay/{ticker}",
    response_model=SignalOverlayResponse,
    summary="Cyclical signal overlay",
    description=(
        "Merges 30-day OHLCV market data with moon phase metadata and Mercury "
        "retrograde windows. Annotates each trading day with cyclical context and "
        "flags volatility spikes. "
        "Experimental correlation surface — no causal claims or trading signals."
    ),
)
async def get_signal_overlay(
    ticker: str = Path(..., description="Market ticker (e.g. BTC-USD, AAPL)"),
):
    # Normalise ticker; allow BTC as shorthand
    ticker = ticker.upper().strip()
    btc_aliases = {"BTC", "BITCOIN", "BTC-USD"}
    if ticker in btc_aliases:
        ticker = "BTC-USD"
    elif ticker not in ALLOWED_TICKERS:
        raise HTTPException(
            status_code=400,
            detail=f"Ticker '{ticker}' not supported. Allowed: {sorted(ALLOWED_TICKERS)} or BTC.",
        )

    try:
        # ── Market data ──────────────────────────────────────────────
        raw = market_service.get_market_data(ticker)
        candles = raw["candles"]

        if not candles:
            raise ValueError("No candle data returned.")

        # Determine actual date range from candles
        first_date = datetime.strptime(candles[0]["date"],  "%Y-%m-%d").replace(tzinfo=timezone.utc)
        last_date  = datetime.strptime(candles[-1]["date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)

        # ── Cyclical metadata ─────────────────────────────────────────
        moon_phases     = get_moon_phases(first_date, last_date)
        retro_windows   = get_retrograde_windows(first_date, last_date)

        # ── Merge ─────────────────────────────────────────────────────
        overlay, spike_threshold = build_overlay(candles, moon_phases, retro_windows)

        major_moon_events = sum(1 for p in overlay if p["is_major_moon_event"])

        return {
            "data": overlay,
            "retrograde_windows": retro_windows,
            "meta": {
                "ticker":            ticker,
                "period":            "30d",
                "data_points":       len(overlay),
                "spike_threshold":   spike_threshold,
                "retrograde_windows": len(retro_windows),
                "major_moon_events": major_moon_events,
                "fetched_at":        datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            },
        }

    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Signal overlay failed: {exc}")
