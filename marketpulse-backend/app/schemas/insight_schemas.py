from pydantic import BaseModel
from typing import Literal


class InsightResponse(BaseModel):
    ticker: str
    price: float
    daily_change: float
    volatility: float
    volatility_shift: float
    trend: Literal["bullish", "bearish", "neutral"]
    momentum: Literal["accelerating", "decelerating", "stable"]
    ma_position: Literal["above", "below"]
    sentiment: Literal["bullish", "bearish", "neutral"]
    positive_day_rate: float
    price_range_30d: float
    ma7: float
    high_30d: float
    low_30d: float
    ai_commentary: str
    commentary_source: Literal["openai", "rule_engine"]
    as_of: str
