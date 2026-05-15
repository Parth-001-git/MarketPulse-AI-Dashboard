"""
Pydantic response schemas for the Phase 3 cyclical signal layer.
All fields are strictly typed so the frontend always receives predictable data.
"""

from pydantic import BaseModel
from typing import List, Literal

MoonPhaseName = Literal[
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
]


class MoonPhasePoint(BaseModel):
    date: str
    illumination: float        # 0–100 %
    phase: MoonPhaseName
    waxing: bool
    strength: float            # 0–1 significance score
    is_major: bool             # True for New/Full moon


class MoonCycleResponse(BaseModel):
    data: List[MoonPhasePoint]
    period_start: str
    period_end: str
    total_points: int


class RetrogradeWindow(BaseModel):
    planet: str
    start: str
    end: str
    active: bool               # Still ongoing at query time


class RetrogradeResponse(BaseModel):
    windows: List[RetrogradeWindow]
    period_start: str
    period_end: str


class OverlayPoint(BaseModel):
    date: str
    close: float
    pct_change: float
    volatility: float
    volume: int
    moon_phase: MoonPhaseName
    moon_illumination: float
    moon_strength: float
    is_major_moon_event: bool
    mercury_retrograde: bool
    volatility_spike: bool
    spike_intensity: float     # Z-score relative to 30d mean


class SignalOverlayMeta(BaseModel):
    ticker: str
    period: str
    data_points: int
    spike_threshold: float
    retrograde_windows: int
    major_moon_events: int
    fetched_at: str


class SignalOverlayResponse(BaseModel):
    data: List[OverlayPoint]
    retrograde_windows: List[RetrogradeWindow]
    meta: SignalOverlayMeta
