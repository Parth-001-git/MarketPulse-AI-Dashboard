"""
Cycles router — Phase 3.
Endpoints:
  GET /cycles/moon           → 30-day moon phase timeline
  GET /cycles/retrograde     → Mercury retrograde windows for the period
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta, timezone

from app.services.cycle_service import get_moon_phases, get_retrograde_windows
from app.schemas.cycle_schemas import MoonCycleResponse, RetrogradeResponse

router = APIRouter()


@router.get(
    "/moon",
    response_model=MoonCycleResponse,
    summary="Moon phase timeline",
    description=(
        "Returns daily moon phase data (illumination %, phase name, waxing/waning, "
        "and significance score) for the past 30 days. "
        "Experimental metadata — not a trading signal."
    ),
)
async def get_moon_cycle(
    days: int = Query(default=30, ge=7, le=90, description="Lookback window in days"),
):
    try:
        end   = datetime.now(timezone.utc)
        start = end - timedelta(days=days)
        data  = get_moon_phases(start, end)
        return {
            "data":         data,
            "period_start": start.strftime("%Y-%m-%d"),
            "period_end":   end.strftime("%Y-%m-%d"),
            "total_points": len(data),
        }
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Cycle computation failed: {exc}")


@router.get(
    "/retrograde",
    response_model=RetrogradeResponse,
    summary="Mercury retrograde windows",
    description=(
        "Returns apparent Mercury retrograde windows within the lookback period. "
        "Retrograde is detected via ecliptic longitude regression (finite-difference). "
        "Experimental metadata — not a trading signal."
    ),
)
async def get_retrograde(
    days: int = Query(default=30, ge=7, le=90, description="Lookback window in days"),
):
    try:
        end     = datetime.now(timezone.utc)
        start   = end - timedelta(days=days)
        windows = get_retrograde_windows(start, end)
        return {
            "windows":      windows,
            "period_start": start.strftime("%Y-%m-%d"),
            "period_end":   end.strftime("%Y-%m-%d"),
        }
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Retrograde computation failed: {exc}")
