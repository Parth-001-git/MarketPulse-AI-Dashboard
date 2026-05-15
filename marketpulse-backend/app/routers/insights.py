"""
Insights router — Phase 2.
Endpoints: /insights/btc  and  /insights/stock/{ticker}
"""

from fastapi import APIRouter, HTTPException, Path
from app.services.insight_service import insight_service
from app.schemas.insight_schemas import InsightResponse
from app.core.config import settings

router = APIRouter()

ALLOWED_TICKERS = {
    "AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "AMD",
    "NFLX", "BABA", "JPM", "GS", "V", "MA", "COIN",
}


@router.get(
    "/btc",
    response_model=InsightResponse,
    summary="AI market insight for BTC-USD",
)
async def btc_insight():
    try:
        return insight_service(settings.BTC_TICKER)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Insight generation failed: {e}")


@router.get(
    "/stock/{ticker}",
    response_model=InsightResponse,
    summary="AI market insight for a stock ticker",
)
async def stock_insight(
    ticker: str = Path(..., min_length=1, max_length=10),
):
    ticker = ticker.upper().strip()
    if ticker not in ALLOWED_TICKERS:
        raise HTTPException(
            status_code=400,
            detail=f"Ticker '{ticker}' not supported. Allowed: {sorted(ALLOWED_TICKERS)}",
        )
    try:
        return insight_service(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Insight generation failed: {e}")
