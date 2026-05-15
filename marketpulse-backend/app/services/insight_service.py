"""
Insight Engine Service.
Runs analytics on raw market data and produces structured intelligence signals
that feed directly into the AI commentary layer.
"""

from __future__ import annotations
import numpy as np
import pandas as pd
from typing import Any
from app.services.market_service import market_service
from app.services.ai_service import generate_commentary


# ─── Signal Classifiers ────────────────────────────────────────────────────────

def _classify_trend(closes: list[float]) -> str:
    if len(closes) < 5:
        return "neutral"
    recent = closes[-5:]
    slope = np.polyfit(range(len(recent)), recent, 1)[0]
    pct = slope / closes[-1] * 100
    if pct > 0.3:
        return "bullish"
    if pct < -0.3:
        return "bearish"
    return "neutral"


def _classify_momentum(pct_changes: list[float]) -> str:
    if len(pct_changes) < 6:
        return "neutral"
    early = np.mean(np.abs(pct_changes[-6:-3]))
    recent = np.mean(np.abs(pct_changes[-3:]))
    if recent > early * 1.1:
        return "accelerating"
    if recent < early * 0.9:
        return "decelerating"
    return "stable"


def _volatility_shift(candles: list[dict]) -> float:
    """Difference between last-week and prior-week rolling volatility."""
    vols = [c["volatility"] for c in candles if c["volatility"] > 0]
    if len(vols) < 14:
        return 0.0
    prior = float(np.mean(vols[-14:-7]))
    recent = float(np.mean(vols[-7:]))
    return round(recent - prior, 2)


def _price_range_pct(closes: list[float]) -> float:
    mn, mx = min(closes), max(closes)
    return round(((mx - mn) / mn) * 100, 2) if mn > 0 else 0.0


def _positive_day_rate(candles: list[dict]) -> float:
    changes = [c["pct_change"] for c in candles]
    pos = sum(1 for c in changes if c > 0)
    return round(pos / len(changes), 4) if changes else 0.5


# ─── Sentiment Resolver ────────────────────────────────────────────────────────

def _overall_sentiment(trend: str, daily_change: float, ma_position: str) -> str:
    score = 0
    if trend == "bullish":
        score += 2
    elif trend == "bearish":
        score -= 2
    if daily_change > 0:
        score += 1
    elif daily_change < 0:
        score -= 1
    if ma_position == "above":
        score += 1
    elif ma_position == "below":
        score -= 1
    if score >= 2:
        return "bullish"
    if score <= -2:
        return "bearish"
    return "neutral"


# ─── Public Interface ──────────────────────────────────────────────────────────

def build_insight(ticker: str) -> dict[str, Any]:
    """
    Full insight pipeline:
      fetch data → compute signals → generate commentary → return structured response.
    """
    raw = market_service.get_market_data(ticker)
    summary = raw["summary"]
    candles = raw["candles"]

    closes = [c["close"] for c in candles]
    pct_changes = [c["pct_change"] for c in candles]

    # ── Signals ──────────────────────────────────────────────────────
    trend = _classify_trend(closes)
    momentum = _classify_momentum(pct_changes)
    vol_shift = _volatility_shift(candles)
    price_range = _price_range_pct(closes)
    pos_rate = _positive_day_rate(candles)
    daily_change = summary["daily_change_pct"]
    volatility = summary["volatility_30d"]
    ma7 = summary["ma7"]
    latest = summary["latest_close"]
    ma_position = "above" if latest > ma7 else "below"
    sentiment = _overall_sentiment(trend, daily_change, ma_position)

    # ── Commentary ────────────────────────────────────────────────────
    commentary, source = generate_commentary(
        ticker=ticker,
        daily_change=daily_change,
        volatility=volatility,
        vol_shift=vol_shift,
        trend=trend,
        momentum=momentum,
        ma_position=ma_position,
        positive_day_rate=pos_rate,
        price_range_pct=price_range,
    )

    return {
        "ticker": ticker,
        "price": summary["latest_close"],
        "daily_change": daily_change,
        "volatility": volatility,
        "volatility_shift": vol_shift,
        "trend": trend,
        "momentum": momentum,
        "ma_position": ma_position,
        "sentiment": sentiment,
        "positive_day_rate": round(pos_rate * 100, 1),
        "price_range_30d": price_range,
        "ma7": ma7,
        "high_30d": summary["high_30d"],
        "low_30d": summary["low_30d"],
        "ai_commentary": commentary,
        "commentary_source": source,
        "as_of": summary["as_of"],
    }


# Module-level singleton
insight_service = build_insight
