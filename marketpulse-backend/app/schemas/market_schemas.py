"""
Pydantic response schemas for all market endpoints.
Strict typing ensures the frontend always receives predictable data shapes.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class CandlePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    pct_change: float
    ma7: float
    volatility: float


class MarketSummary(BaseModel):
    ticker: str
    latest_close: float
    daily_change_pct: float
    ma7: float
    high_30d: float
    low_30d: float
    avg_volume: float
    volatility_30d: float
    as_of: str


class MarketMeta(BaseModel):
    period: str
    interval: str
    data_points: int
    fetched_at: str


class MarketDataResponse(BaseModel):
    summary: MarketSummary
    candles: List[CandlePoint]
    meta: MarketMeta


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
