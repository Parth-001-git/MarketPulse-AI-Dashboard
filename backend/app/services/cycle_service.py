"""
Cyclical Signal Engine — Phase 3.
Computes moon phases and planetary retrograde periods using ephem.

IMPORTANT POSITIONING:
  This is NOT an astrology or prediction system.
  It is an experimental metadata overlay tool for behavioral market research.
  No buy/sell signals are generated. No causal claims are made.

Separation of concerns:
  - cycle_service  →  astronomical metadata only
  - market_service →  market OHLCV + indicators only
  - signals router →  merges both into OverlayPoint records
"""

from __future__ import annotations

import math
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import ephem
import numpy as np
from app.core.observability import CYCLE_PROCESS_DURATION

logger = logging.getLogger(__name__)

# ─── Phase Classification ──────────────────────────────────────────────────────

_PHASE_STRENGTH: dict[str, float] = {
    "New Moon":       1.0,
    "Full Moon":      1.0,
    "First Quarter":  0.65,
    "Last Quarter":   0.65,
    "Waxing Gibbous": 0.35,
    "Waning Gibbous": 0.35,
    "Waxing Crescent": 0.15,
    "Waning Crescent": 0.15,
}

_MAJOR_PHASES = {"New Moon", "Full Moon"}


def _illumination(date: datetime) -> float:
    """Moon illumination percentage (0–100) for the given UTC date."""
    moon = ephem.Moon()
    moon.compute(date.strftime("%Y/%m/%d %H:%M:%S"))
    return float(moon.phase)


def _is_waxing(date: datetime) -> bool:
    """True if the moon is growing (waxing) on this date."""
    today_illum = _illumination(date)
    tomorrow_illum = _illumination(date + timedelta(hours=24))
    return tomorrow_illum > today_illum


def classify_moon_phase(illumination: float, waxing: bool) -> str:
    """Map illumination + direction to a named phase."""
    if illumination < 2.5:
        return "New Moon"
    if illumination >= 97.5:
        return "Full Moon"
    if waxing:
        if illumination < 45:
            return "Waxing Crescent"
        if illumination <= 55:
            return "First Quarter"
        return "Waxing Gibbous"
    else:
        if illumination > 55:
            return "Waning Gibbous"
        if illumination >= 45:
            return "Last Quarter"
        return "Waning Crescent"


# ─── Moon Phase Timeline ───────────────────────────────────────────────────────

def get_moon_phases(
    start: datetime,
    end: datetime,
) -> list[dict[str, Any]]:
    """Return one MoonPhasePoint dict per calendar day in [start, end]."""
    results: list[dict[str, Any]] = []
    current = start.replace(hour=12, minute=0, second=0, microsecond=0)
    while current.date() <= end.date():
        try:
            illum = _illumination(current)
            waxing = _is_waxing(current)
            phase = classify_moon_phase(illum, waxing)
            results.append({
                "date": current.strftime("%Y-%m-%d"),
                "illumination": round(illum, 2),
                "phase": phase,
                "waxing": waxing,
                "strength": _PHASE_STRENGTH.get(phase, 0.1),
                "is_major": phase in _MAJOR_PHASES,
            })
        except Exception as exc:
            logger.warning("Moon phase error on %s: %s", current.date(), exc)
        current += timedelta(days=1)
    return results


# ─── Mercury Retrograde Detection ─────────────────────────────────────────────

def _mercury_ecliptic_lon(date: datetime) -> float:
    """Ecliptic longitude of Mercury in radians at noon UTC on given date."""
    mercury = ephem.Mercury()
    mercury.compute(date.strftime("%Y/%m/%d 12:00:00"), epoch=ephem.J2000)
    return float(mercury.hlong)


def _lon_diff(a: float, b: float) -> float:
    """Signed angular difference a − b, accounting for 2π wrap-around."""
    diff = a - b
    if diff > math.pi:
        diff -= 2 * math.pi
    elif diff < -math.pi:
        diff += 2 * math.pi
    return diff


def _is_retrograde_on(date: datetime) -> bool:
    """
    True if Mercury appears to move retrograde (ecliptic longitude decreasing)
    at the given date, using a 2-day finite-difference approximation.
    """
    lon_prev = _mercury_ecliptic_lon(date - timedelta(days=1))
    lon_next = _mercury_ecliptic_lon(date + timedelta(days=1))
    return _lon_diff(lon_next, lon_prev) < 0


def get_retrograde_windows(
    start: datetime,
    end: datetime,
) -> list[dict[str, Any]]:
    """
    Return retrograde event windows for Mercury in [start, end].
    Each window has start/end date strings and an 'active' flag.
    """
    # Build per-day retrograde booleans
    day_flags: list[tuple[str, bool]] = []
    current = start
    end_date = end.date()
    while current.date() <= end_date:
        try:
            retro = _is_retrograde_on(current)
        except Exception as exc:
            logger.warning("Retrograde error on %s: %s", current.date(), exc)
            retro = False
        day_flags.append((current.strftime("%Y-%m-%d"), retro))
        current += timedelta(days=1)

    # Collapse consecutive True runs into windows
    windows: list[dict[str, Any]] = []
    in_window = False
    window_start: str = ""

    for date_str, is_retro in day_flags:
        if is_retro and not in_window:
            in_window = True
            window_start = date_str
        elif not is_retro and in_window:
            in_window = False
            windows.append({
                "planet": "Mercury",
                "start": window_start,
                "end": date_str,
                "active": False,
            })

    if in_window:
        windows.append({
            "planet": "Mercury",
            "start": window_start,
            "end": day_flags[-1][0],
            "active": True,
        })

    return windows


# ─── Overlay Merge ─────────────────────────────────────────────────────────────

def build_overlay(
    candles: list[dict[str, Any]],
    moon_phases: list[dict[str, Any]],
    retro_windows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], float]:
    """
    Merge market candles with cyclical metadata into OverlayPoint records.
    Returns (overlay_points, spike_threshold).

    Volatility spike = daily volatility > mean + 1.5σ over the 30-day window.
    """
    # Use ticker="unknown" as a fallback since build_overlay doesn't get ticker directly, 
    # but we can just use "overall" or let the router instrument it instead.
    # We will just time the loop.
    with CYCLE_PROCESS_DURATION.labels(ticker="combined").time():
        moon_by_date = {m["date"]: m for m in moon_phases}

        # Build retrograde date lookup
        retro_dates: set[str] = set()
        for w in retro_windows:
            start_d = datetime.strptime(w["start"], "%Y-%m-%d").date()
            end_d   = datetime.strptime(w["end"],   "%Y-%m-%d").date()
            cur = start_d
            while cur <= end_d:
                retro_dates.add(cur.strftime("%Y-%m-%d"))
                cur += timedelta(days=1)

        # Volatility spike threshold
        vols = [c["volatility"] for c in candles if c["volatility"] > 0]
        vol_mean = float(np.mean(vols)) if vols else 0.0
        vol_std  = float(np.std(vols))  if vols else 1.0
        spike_threshold = vol_mean + 1.5 * vol_std

        overlay: list[dict[str, Any]] = []
        for candle in candles:
            date = candle["date"]
            moon = moon_by_date.get(date, {})
            vol  = candle["volatility"]
            is_spike = vol > spike_threshold
            z_score  = round((vol - vol_mean) / vol_std, 2) if vol_std > 0 else 0.0

            overlay.append({
                "date":               date,
                "close":              candle["close"],
                "pct_change":         candle["pct_change"],
                "volatility":         vol,
                "volume":             candle["volume"],
                "moon_phase":         moon.get("phase", "Waxing Crescent"),
                "moon_illumination":  moon.get("illumination", 0.0),
                "moon_strength":      moon.get("strength", 0.0),
                "is_major_moon_event": moon.get("is_major", False),
                "mercury_retrograde": date in retro_dates,
                "volatility_spike":   is_spike,
                "spike_intensity":    z_score,
            })

    return overlay, round(spike_threshold, 4)
