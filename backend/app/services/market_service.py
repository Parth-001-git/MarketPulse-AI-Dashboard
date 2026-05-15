"""
Market data processing service.
Fetches, cleans, and enriches market data using yfinance.
"""

from typing import List, Dict, Any
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timezone
import logging
from app.core.observability import MARKET_FETCH_DURATION

logger = logging.getLogger(__name__)


class MarketDataService:
    """
    Handles all interactions with yfinance and transforms
    raw OHLCV data into structured, indicator-enriched responses.
    """

    def __init__(self, period: str = "30d", interval: str = "1d"):
        self.period = period
        self.interval = interval

    # ─── Private Helpers ──────────────────────────────────────────────

    def _fetch_raw(self, ticker: str) -> pd.DataFrame:
        """Download raw OHLCV data from yfinance."""
        tk = yf.Ticker(ticker)
        df = tk.history(period=self.period, interval=self.interval)
        if df.empty:
            raise ValueError(f"No data returned for ticker '{ticker}'")
        return df

    def _clean(self, df: pd.DataFrame) -> pd.DataFrame:
        """Drop NA rows and reset timezone-aware index to UTC strings."""
        df = df.dropna(subset=["Close"])
        df.index = pd.to_datetime(df.index, utc=True)
        return df

    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Append derived columns: pct_change, ma7, volatility."""
        df = df.copy()
        df["pct_change"] = df["Close"].pct_change() * 100
        df["ma7"] = df["Close"].rolling(window=7, min_periods=1).mean()

        # Annualised volatility from daily log returns (30-day window)
        log_returns = np.log(df["Close"] / df["Close"].shift(1))
        df["volatility"] = log_returns.rolling(window=7, min_periods=1).std() * np.sqrt(252) * 100

        return df

    def _to_candle_records(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Convert DataFrame to list of OHLCV + indicator dicts."""
        records = []
        for ts, row in df.iterrows():
            records.append({
                "date": ts.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 4),
                "high": round(float(row["High"]), 4),
                "low": round(float(row["Low"]), 4),
                "close": round(float(row["Close"]), 4),
                "volume": int(row["Volume"]) if not np.isnan(row["Volume"]) else 0,
                "pct_change": round(float(row["pct_change"]), 4) if not np.isnan(row["pct_change"]) else 0.0,
                "ma7": round(float(row["ma7"]), 4),
                "volatility": round(float(row["volatility"]), 4) if not np.isnan(row["volatility"]) else 0.0,
            })
        return records

    def _build_summary(self, df: pd.DataFrame, ticker: str) -> Dict[str, Any]:
        """Build a concise summary of the latest snapshot."""
        latest = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else df.iloc[-1]

        latest_close = float(latest["Close"])
        prev_close = float(prev["Close"])
        daily_change_pct = ((latest_close - prev_close) / prev_close) * 100 if prev_close != 0 else 0.0

        closes = df["Close"]
        high_30d = float(closes.max())
        low_30d = float(closes.min())
        avg_volume = float(df["Volume"].mean()) if "Volume" in df.columns else 0.0

        log_returns = np.log(closes / closes.shift(1)).dropna()
        volatility_30d = float(log_returns.std() * np.sqrt(252) * 100)

        return {
            "ticker": ticker,
            "latest_close": round(latest_close, 4),
            "daily_change_pct": round(daily_change_pct, 4),
            "ma7": round(float(df["Close"].rolling(7, min_periods=1).mean().iloc[-1]), 4),
            "high_30d": round(high_30d, 4),
            "low_30d": round(low_30d, 4),
            "avg_volume": round(avg_volume, 2),
            "volatility_30d": round(volatility_30d, 4),
            "as_of": df.index[-1].strftime("%Y-%m-%dT%H:%M:%SZ"),
        }

    # ─── Public API ───────────────────────────────────────────────────

    def get_market_data(self, ticker: str) -> Dict[str, Any]:
        """
        Full pipeline: fetch → clean → calculate indicators → structure.
        Returns a dict with `summary` and `candles` keys.
        """
        logger.info(f"Fetching market data for {ticker}")
        with MARKET_FETCH_DURATION.labels(ticker=ticker).time():
            df = self._fetch_raw(ticker)
            df = self._clean(df)
            df = self._calculate_indicators(df)
            candles = self._to_candle_records(df)
            summary = self._build_summary(df, ticker)

        return {
            "summary": summary,
            "candles": candles,
            "meta": {
                "period": self.period,
                "interval": self.interval,
                "data_points": len(candles),
                "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            },
        }


# Module-level singleton
market_service = MarketDataService()
