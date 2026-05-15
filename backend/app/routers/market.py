"""
Market data router.
Exposes /market/btc and /market/stock/{ticker} endpoints.
"""

from fastapi import APIRouter, HTTPException, Path
from app.services.market_service import market_service
from app.schemas.market_schemas import MarketDataResponse, ErrorResponse
from app.core.config import settings

router = APIRouter()

ALLOWED_TICKERS = {
    "AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "AMD",
    "NFLX", "BABA", "JPM", "GS", "V", "MA", "COIN",
}


@router.get(
    "/btc",
    response_model=MarketDataResponse,
    summary="Get BTC-USD market data",
    description="Returns 30-day OHLCV candles plus computed indicators for Bitcoin (BTC-USD).",
)
async def get_btc_data():
    try:
        data = market_service.get_market_data(settings.BTC_TICKER)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream data error: {str(e)}")


@router.get(
    "/stock/{ticker}",
    response_model=MarketDataResponse,
    summary="Get stock market data",
    description="Returns 30-day OHLCV candles plus computed indicators for the given stock ticker.",
)
async def get_stock_data(
    ticker: str = Path(
        ...,
        description="Stock ticker symbol (e.g., AAPL, TSLA)",
        min_length=1,
        max_length=10,
    )
):
    ticker = ticker.upper().strip()

    if ticker not in ALLOWED_TICKERS:
        raise HTTPException(
            status_code=400,
            detail=f"Ticker '{ticker}' is not supported. Allowed: {sorted(ALLOWED_TICKERS)}",
        )

    try:
        data = market_service.get_market_data(ticker)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream data error: {str(e)}")


@router.get(
    "/tickers",
    summary="List supported stock tickers",
)
async def list_tickers():
    return {"tickers": sorted(ALLOWED_TICKERS)}
