# 📈 Market Intelligence Dashboard

A production-ready, full-stack Market Intelligence platform featuring real-time financial data, AI-generated insights, experimental cyclical signal overlays, and comprehensive operational observability.

This project was built progressively across 6 distinct phases to demonstrate end-to-end full-stack AI engineering, data pipeline architecture, and DevOps maturity.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Recharts, Lucide Icons.
- **Backend**: FastAPI, Python 3.11, Uvicorn.
- **Data Engineering**: `yfinance` (real-time market data), `pandas` (OHLCV indicators), `ephem` (astronomical calculations).
- **AI Layer**: OpenAI API (`gpt-4o-mini` / `gpt-3.5-turbo`) with deterministic rule-engine fallback.
- **Observability**: Prometheus (metrics), Grafana (dashboards), Loki (logging).
- **Infrastructure**: Docker, Docker Compose, Vercel (Frontend Hosting), Render/Railway (Backend Hosting).

---

## 🚀 Implemented Phases

### Phase 1: Market Data Pipeline
- Real-time fetching of BTC and stock tickers via `yfinance`.
- 30-day OHLCV histories with moving averages, percentage changes, and volatility computations.

### Phase 2: AI Insights
- Dynamic OpenAI-powered market commentary analyzing recent momentum and volatility.
- Robust deterministic fallback engine when OpenAI keys are omitted or unavailable.

### Phase 3: Cyclical Signal Analysis
- Experimental metadata overlays comparing market momentum against moon phases and Mercury retrograde windows.
- *Disclaimer: These are strictly experimental metadata overlays and do not constitute financial or trading advice.*

### Phase 4 & 5: Observability & Containerization
- **Prometheus** metrics exposing API request rates, latency histograms, and operation durations.
- **Loki** structured logging streamed directly from the FastAPI application.
- Fully orchestrated via a resilient `docker-compose.yml` multi-container architecture.

### Phase 6: Live Deployment
- Infrastructure-as-code prepared for seamless deployment to Vercel and Render.
- Hardened CORS configurations, `gunicorn`/`uvicorn` worker tuning, and integrated deployment status monitoring.

---

## 🔌 API Endpoints

The FastAPI backend exposes the following primary routes (see `/api/docs` for the interactive Swagger UI):

- **Market Data**:
  - `GET /market/btc` — Returns BTC OHLCV data.
  - `GET /market/stock/{ticker}` — Returns stock OHLCV data (e.g. AAPL, TSLA).
- **AI Insights**:
  - `GET /insights/btc` — Returns AI/Rule-based commentary for BTC.
  - `GET /insights/stock/{ticker}` — Returns AI commentary for stocks.
- **Cyclical Signals**:
  - `GET /cycles/moon` — 30-day lunar phase tracking.
  - `GET /cycles/retrograde` — Apparent retrograde windows.
  - `GET /signals/overlay/{ticker}` — Merged market data with cyclical metadata and volatility spikes.
- **Observability**:
  - `GET /health` — Multi-phase system health check.
  - `GET /metrics` — Prometheus telemetry output.

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env` in the project root:

```env
# Backend Server
API_HOST=0.0.0.0
API_PORT=8000
ALLOWED_ORIGINS=["*"]
OPENAI_API_KEY=your_openai_api_key_here

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Observability Configuration
GRAFANA_PASSWORD=admin
LOKI_URL=http://loki:3100/loki/api/v1/push
```

---

## 🐳 How to Run Locally

Boot the entire platform (Frontend, Backend, and Observability stack) using Docker Compose:

```bash
# Build and start all services
docker-compose up --build -d

# View live application logs
docker-compose logs -f
```

### Accessing Local Services
- **Dashboard UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Swagger Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Grafana Observability**: [http://localhost:3001](http://localhost:3001) *(Login: admin/admin)*
- **Prometheus**: [http://localhost:9090](http://localhost:9090)

---

## 🌐 How to Demo the Project (Cloud Deployment)

The project is fully pre-configured for live web deployment:
1. **Backend (Render)**: Connect your GitHub to Render and deploy using the included `render.yaml` blueprint. 
   - Ensure `OPENAI_API_KEY` is set.
   - Example Backend URL: `https://market-intelligence-api.onrender.com`
2. **Frontend (Vercel)**: Import the `frontend/` directory into Vercel using the included `vercel.json`. 
   - Set the `NEXT_PUBLIC_API_URL` environment variable to your new Render backend URL.
   - Example Frontend URL: `https://market-intelligence-dashboard.vercel.app`
3. The dashboard UI will automatically ping the live backend, render real-time charts, evaluate system health, and flash a **Live** deployment indicator.

---

## ⚠️ Limitations & Disclaimers

1. **Not Financial Advice**: The cyclical and astrological features are intended purely as a curiosity-driven technical exercise demonstrating metadata overlaying. They should **never** be used for actual trading or financial decisions.
2. **Rate Limits**: The `yfinance` library relies on public Yahoo Finance endpoints which are subject to unofficial rate limiting. High frequency polling may result in temporary bans.
3. **OpenAI Cost**: Insight generation incurs minor token costs if `OPENAI_API_KEY` is active.
