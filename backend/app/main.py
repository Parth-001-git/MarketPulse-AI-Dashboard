from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import market, insights, cycles, signals
from app.core.config import settings
from app.core.observability import setup_observability
import time

app = FastAPI(
    title="Market Intelligence API",
    description=(
        "Phase 6 — Production Deploy · Observability · Market Data · AI Insights · Cyclical Signals. "
        "Powered by yfinance, OpenAI, and ephem. "
        "Cyclical features are experimental metadata overlays — not trading signals."
    ),
    version="6.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

allow_all = "*" in settings.ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_observability(app)

app.include_router(market.router,  prefix="/market",  tags=["Market Data"])
app.include_router(insights.router, prefix="/insights", tags=["AI Insights"])
app.include_router(cycles.router,  prefix="/cycles",  tags=["Cyclical Metadata"])
app.include_router(signals.router, prefix="/signals", tags=["Signal Overlays"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status":  "operational",
        "service": "market-intelligence-api",
        "version": "6.0.0",
        "phases":  ["market-data", "ai-insights", "cyclical-signals", "observability", "docker", "deployment"],
        "timestamp": time.time()
    }
