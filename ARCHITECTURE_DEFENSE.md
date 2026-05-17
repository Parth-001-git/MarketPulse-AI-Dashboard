# Market Intelligence Platform

Complete System Architecture and Project Defense Handbook

Prepared for backend engineering, AI systems, system design, production-readiness, and project deep-dive interviews.

## How To Use This Document

This document is written as an interview defense handbook, not as academic architecture theory. The goal is to help you explain the system like a practical engineer: what exists today, why each part exists, what tradeoffs were made, what can fail, and how the system could mature without unnecessary overengineering.

Important distinction:

- Current implementation: Next.js frontend, FastAPI backend, yfinance data ingestion, AI/rule-based insights, cyclical overlays, Docker Compose, Prometheus, Grafana, Loki, and deployment preparation.
- Production target architecture: PostgreSQL, Redis, RabbitMQ, async workers, scheduled ingestion, stronger authentication, durable storage, and more mature reliability controls.

In interviews, do not claim every production extension is already implemented. Say: "The current version is a lean, demo-ready platform. The production design adds durable storage, caching, and asynchronous workers once usage patterns justify them."

---

# 1. Executive Summary

## What The System Does

The Market Intelligence Platform is an AI-assisted financial analytics system that collects market data, enriches it with technical indicators, generates AI-assisted commentary, overlays experimental cyclical metadata, and presents everything through a dashboard with operational observability.

At a practical level, the system answers:

- What is happening in the market right now?
- How has an asset moved over the last 30 days?
- Are volatility, momentum, and moving averages changing?
- Can AI summarize the current market state in plain language?
- Can non-traditional cyclical metadata be overlaid for exploratory pattern research?
- Is the system itself healthy, observable, and deployable?

## Core Problem Solved

Market intelligence is often scattered across charts, financial APIs, news summaries, and manual analysis. A user has to move between tools to understand price movement, trend, volatility, commentary, and system freshness.

This project unifies those pieces into one operationally aware platform:

- Market data comes from an external source.
- The backend normalizes and computes indicators.
- AI converts numeric signals into readable commentary.
- The frontend visualizes price, volatility, AI insights, and cycle overlays.
- Observability tools show whether the system is operating correctly.

## Why The Problem Matters

For an investor, analyst, founder, or technical evaluator, raw prices are not enough. Useful intelligence needs context, summaries, confidence boundaries, and operational trust.

This matters because:

- Market data can be noisy.
- External APIs can fail or rate-limit.
- AI outputs need guardrails and fallbacks.
- Dashboards need to show data freshness.
- Engineering systems need observability, not just UI polish.

## Who Benefits

Primary users:

- Analysts who want a fast read on market conditions.
- Engineers evaluating market data pipeline design.
- Interviewers looking for backend, AI, and operational thinking.
- Portfolio reviewers assessing end-to-end product maturity.

Secondary users:

- Product managers exploring AI-assisted dashboards.
- Developers learning FastAPI, Next.js, Docker, and observability.
- Data enthusiasts exploring volatility and cyclical overlays.

## Business Value

The business value is not "predict the market with certainty." The value is reducing analysis friction.

The platform provides:

- Faster market understanding.
- Consistent market summaries.
- Visual correlation exploration.
- Operationally transparent backend behavior.
- A foundation for future alerting, watchlists, personalization, and scheduled reports.

Interview framing:

"I built this as a practical market intelligence platform, not just a charting app. The differentiator is that it combines data ingestion, AI summarization, experimental signal overlays, and observability in one coherent system."

---

# 2. Problem Statement

## Existing Inefficiencies

Most market dashboards solve only one part of the workflow:

- Charting tools show price but not backend health.
- News tools summarize events but may not connect to technical indicators.
- AI chat tools can summarize but may not use structured market data.
- Monitoring tools observe systems but are separate from the application.

The result is fragmented decision support.

Common inefficiencies:

- Repeated manual checking of ticker data.
- Lack of concise, explainable market summaries.
- No clear distinction between data, interpretation, and prediction.
- Weak data freshness signals.
- No observability into API latency, errors, and upstream failures.

## Challenges In Market Intelligence Gathering

Market intelligence has several hard parts:

1. External data reliability
   - Public market data sources can be delayed, unavailable, or rate-limited.
   - Data may have missing rows, irregular timestamps, or empty responses.

2. Interpretation quality
   - Raw OHLCV data is not useful to everyone.
   - Indicators need to be translated into clear, cautious language.

3. Latency and cost
   - AI calls can add latency and token cost.
   - Re-fetching market data on every request is simple but inefficient at scale.

4. User trust
   - The system must avoid making financial guarantees.
   - Experimental overlays need disclaimers and clear boundaries.

5. Operational reality
   - A dashboard is only credible if the API, logs, metrics, and deployment story are credible.

## Why AI-Assisted Workflows Help

AI is useful here when it is constrained and grounded by structured data.

Good AI usage:

- Summarize computed indicators.
- Explain volatility and trend in plain language.
- Generate concise market commentary.
- Support fallback behavior when the AI provider is unavailable.

Bad AI usage:

- Claim guaranteed predictions.
- Invent missing market events.
- Replace deterministic calculations.
- Hide uncertainty.

The architecture uses AI as an interpretation layer, not as the source of truth.

## Pain Points Addressed

The platform addresses:

- "I need a quick market snapshot."
- "I want AI commentary grounded in data."
- "I want to inspect volatility and price movement visually."
- "I want to experiment with cycle overlays without pretending they are guaranteed signals."
- "I want to know whether the backend is healthy."
- "I want a project that demonstrates production thinking."

---

# 3. Functional Requirements

## Data Ingestion

The system must ingest market data for supported assets.

Current implementation:

- Fetches BTC and selected stock ticker data using yfinance.
- Retrieves recent OHLCV candles.
- Computes derived fields like percentage change, moving average, and volatility.

Production extension:

- Scheduled ingestion jobs persist data into PostgreSQL.
- Ingestion workers run asynchronously.
- Failed ingestion attempts are retried.
- Data freshness is tracked per ticker.

## AI Summarization

The system must convert structured indicators into readable commentary.

Current implementation:

- Uses OpenAI when an API key is available.
- Falls back to a deterministic rule engine if no key exists or the provider fails.

Production extension:

- Store AI summaries with timestamps and prompt versions.
- Cache summaries to reduce token cost.
- Track AI latency, failures, and fallback rates.

## Trend Detection

The system should detect basic trend characteristics.

Examples:

- Bullish, bearish, or neutral trend.
- Accelerating, decelerating, or stable momentum.
- Price relative to moving average.
- Positive session rate.
- Volatility changes.

Reasoning:

These are explainable signals. Interviewers usually prefer simple, inspectable logic over black-box claims.

## Signal Extraction

The system should surface useful analytical signals without overclaiming.

Current examples:

- Volatility spikes.
- Moving average position.
- 30-day high and low.
- Moon phase metadata.
- Retrograde metadata.
- Cycle overlay points.

Important framing:

Cycle overlays are experimental metadata, not trading advice.

## Dashboard Visualization

The frontend must visualize:

- Current BTC and stock snapshots.
- Price charts.
- Volatility charts.
- AI insight cards.
- Operational status.
- Cyclical signal overlay.
- Loading and error states.

## Search And Filtering

Current implementation:

- Supports selected tickers through a controlled list.

Production extension:

- Search tickers.
- Filter by asset type.
- Save watchlists.
- Compare multiple assets.
- Paginate historical results.

## User Workflows

Primary workflows:

1. Open dashboard.
2. View current market overview.
3. Select ticker.
4. Inspect price, volatility, and indicators.
5. Read AI-generated or rule-based commentary.
6. Review experimental cyclical overlay.
7. Check backend/system health.

Production workflows:

- Create watchlist.
- Configure alert thresholds.
- Schedule daily summaries.
- Export reports.
- View historical AI summaries.

## Automation

Current implementation:

- On-demand fetching through API routes.

Production extension:

- Scheduled ingestion every N minutes.
- Background AI summarization.
- Alert generation.
- Daily email or Slack summaries.
- Retry jobs for failed external calls.

---

# 4. Non-Functional Requirements

## Scalability

The initial system is intentionally simple. It can support demo and low-volume usage with synchronous API fetching.

Scaling path:

- Add Redis caching for repeated market requests.
- Add PostgreSQL for durable market snapshots and summaries.
- Add RabbitMQ and workers for ingestion and AI jobs.
- Horizontally scale stateless FastAPI instances.
- Separate ingestion load from user-facing API latency.

## Reliability

Reliability goals:

- API should return useful errors instead of crashing.
- AI provider failures should fall back to rule-based commentary.
- External data failures should be visible through logs and metrics.
- Docker healthchecks should verify backend readiness.

## Observability

The system needs:

- Metrics for request count, latency, and errors.
- Custom metrics for market fetch, AI insight, and cycle processing duration.
- Logs shipped to Loki.
- Grafana dashboards for operations.
- Health endpoint for service readiness.

## Security

Current demo posture:

- No sensitive user data.
- Optional OpenAI key via environment variable.
- CORS configurable.

Production posture:

- JWT authentication.
- Per-user watchlists.
- Rate limiting.
- Secret management.
- Audit logging.
- Safer CORS allowlist.

## Maintainability

Maintainability comes from separation of concerns:

- Routers handle HTTP.
- Services handle business logic.
- Schemas define response contracts.
- Frontend components stay focused on presentation.
- Observability setup is isolated.

## Latency Expectations

Current expected behavior:

- Health endpoint: very fast.
- Market data endpoint: depends on yfinance latency.
- AI insights: slower when OpenAI is used.
- Rule-based fallback: fast.

Production target:

- Cached dashboard requests under 300 ms.
- Ingestion jobs independent from user-facing requests.
- AI summaries precomputed or cached.

## Fault Tolerance

Fault tolerance mechanisms:

- Rule-based fallback for AI failures.
- HTTP exceptions for upstream failures.
- Docker restart policies.
- Healthchecks.
- Future retries and dead-letter queues for async jobs.

## Cost Awareness

Cost drivers:

- AI token usage.
- Hosting compute.
- External API calls.
- Observability retention.

Cost controls:

- Cache AI summaries.
- Limit supported tickers initially.
- Use scheduled ingestion intervals.
- Avoid unnecessary high-frequency polling.
- Use local observability for demos.

---

# 5. High-Level Architecture

## Current Architecture

Text diagram:

```text
User Browser
  -> Next.js Dashboard
  -> FastAPI Backend
  -> yfinance / OpenAI / ephem
  -> API Response
  -> Dashboard Charts and Cards

FastAPI Backend
  -> Prometheus /metrics
  -> Loki logs
  -> Grafana dashboards
```

## Production Target Architecture

Text diagram:

```text
User
  -> Frontend Dashboard
  -> Backend API
  -> Redis Cache
  -> PostgreSQL
  -> RabbitMQ
  -> Ingestion Workers
  -> AI Processing Workers
  -> External APIs
  -> Observability Stack
```

Expanded flow:

```text
User request
  -> Next.js UI
  -> FastAPI API
  -> Auth and validation
  -> Redis cache lookup
  -> PostgreSQL query if cache miss
  -> Queue async refresh if stale
  -> Return response
  -> Emit metrics and logs
```

Async ingestion flow:

```text
Scheduler
  -> RabbitMQ job
  -> Worker fetches market data
  -> Worker computes indicators
  -> Worker stores snapshot in PostgreSQL
  -> Worker invalidates Redis keys
  -> Metrics/logs emitted
```

AI workflow flow:

```text
New market snapshot
  -> AI summary job queued
  -> Worker builds prompt from structured data
  -> AI provider call
  -> Validate output
  -> Store summary and metadata
  -> Fallback to rule engine if needed
```

## Why Every Component Exists

Frontend:

- Provides the user-facing dashboard.
- Makes complex market data readable.
- Shows loading, error, and operational states.

Backend API:

- Centralizes business logic.
- Protects external provider details from the frontend.
- Defines stable contracts for market data, insights, and overlays.

PostgreSQL:

- Needed when data must be durable.
- Supports historical queries, user accounts, watchlists, summaries, and audit trails.
- Best fit for relational and time-indexed analytical data.

Redis:

- Reduces repeated external API calls.
- Improves dashboard latency.
- Provides temporary cache for hot tickers and summaries.

RabbitMQ:

- Separates slow work from request/response latency.
- Helps with retries, backpressure, and failure isolation.

AI Processing Layer:

- Converts structured market signals into readable commentary.
- Keeps AI-specific prompt and fallback logic isolated.

Ingestion Workers:

- Fetch and normalize market data outside user requests.
- Improve reliability and consistency.

Observability Stack:

- Makes system behavior inspectable.
- Helps debug latency, failures, provider issues, and deployment problems.

Scheduler:

- Triggers recurring ingestion and summary jobs.
- Keeps data fresh without relying only on user traffic.

---

# 6. Detailed Component Breakdown

## Frontend Dashboard

Purpose:

The dashboard is the product surface. It turns backend responses into charts, insight cards, operational status, and experimental overlay visualizations.

Responsibilities:

- Fetch backend API data.
- Render market overview.
- Render BTC and stock sections.
- Display AI commentary.
- Display cyclical overlays.
- Show loading and error states.
- Reflect backend health.

Interactions:

- Calls FastAPI endpoints through a shared API client.
- Reads `NEXT_PUBLIC_API_URL`.
- Receives JSON response contracts defined by backend schemas.

Bottlenecks:

- Slow backend responses.
- Client-side API URL misconfiguration.
- Large chart payloads if history grows.

Scaling considerations:

- Static hosting through Vercel or Cloudflare Pages.
- CDN caching for static assets.
- Keep runtime API base URL environment-specific.

Failure scenarios:

- Backend unavailable.
- CORS misconfigured.
- API response shape changes.
- Browser cannot resolve internal Docker hostname.

Monitoring requirements:

- Frontend build success.
- Runtime API errors.
- Dashboard load time.
- User-visible error states.

Interview defense:

"I kept the frontend mostly as a visualization layer. Business calculations belong in the backend so the API remains the source of truth."

## Backend API

Purpose:

The FastAPI backend owns business logic, external integrations, validation, observability, and API contracts.

Responsibilities:

- Serve market data routes.
- Serve AI insight routes.
- Serve cycle metadata routes.
- Serve signal overlay routes.
- Expose health and metrics endpoints.
- Apply CORS.
- Normalize upstream provider data.

Interactions:

- Calls yfinance for market data.
- Calls OpenAI optionally.
- Uses ephem for astronomical metadata.
- Exposes metrics to Prometheus.
- Sends logs to Loki.

Bottlenecks:

- yfinance latency.
- OpenAI latency.
- CPU-heavy pandas operations if payloads grow.
- No durable cache in current demo version.

Scaling considerations:

- Stateless API can be horizontally scaled.
- Add Redis cache for common requests.
- Move ingestion and AI work to background workers.
- Use PostgreSQL to avoid repeated external calls.

Failure scenarios:

- External API returns empty data.
- AI provider times out.
- Bad ticker input.
- Metrics/logging backend unreachable.

Monitoring requirements:

- Request count.
- Request latency.
- Error rate.
- Upstream fetch duration.
- AI insight duration.
- Cycle processing duration.

Interview defense:

"The backend is intentionally the integration boundary. The frontend should not know whether data came from yfinance, cache, database, or workers."

## PostgreSQL

Current status:

Not required in the current live/demo version. The current backend fetches data on demand.

Production purpose:

PostgreSQL becomes important when the product needs durable storage, historical analysis, user accounts, watchlists, saved summaries, or auditability.

Responsibilities:

- Store users.
- Store assets/tickers.
- Store market candles.
- Store computed indicators.
- Store AI summaries.
- Store user watchlists.
- Store job metadata.
- Store alerts and notification history.

Interactions:

- API reads cached/historical data.
- Workers write ingestion results.
- AI workers read latest snapshots and write summaries.
- Scheduler reads job state.

Bottlenecks:

- High write volume for many assets and frequent intervals.
- Heavy analytical queries over long time ranges.
- Poor indexing on ticker/time columns.

Scaling considerations:

- Index `(asset_id, timestamp)`.
- Partition large candle tables by time if needed.
- Use read replicas for analytics.
- Store raw and derived data separately.

Failure scenarios:

- DB connection pool exhaustion.
- Slow queries.
- Migration errors.
- Duplicate candle inserts.

Monitoring requirements:

- Query latency.
- Connection pool usage.
- Deadlocks.
- Row counts and table size.
- Failed migrations.

Interview defense:

"I would add PostgreSQL once I need durable history and user-specific workflows. Until then, keeping the demo stateless reduces operational complexity."

## Redis

Current status:

Not required in the current demo version.

Production purpose:

Redis is the low-latency cache for hot market responses, AI summaries, and operational lookups.

Responsibilities:

- Cache latest ticker snapshots.
- Cache AI summaries.
- Cache supported ticker lists.
- Store rate-limit counters.
- Store short-lived job status.

Interactions:

- API checks Redis before PostgreSQL or external calls.
- Workers invalidate or update cache after ingestion.
- Rate limiter increments request counters.

Bottlenecks:

- Memory pressure.
- Too many unique cache keys.
- Stale cache if invalidation is wrong.

Scaling considerations:

- Use TTLs.
- Avoid caching extremely large payloads.
- Use predictable key names.
- Monitor memory and evictions.

Failure scenarios:

- Redis unavailable.
- Stale values.
- Thundering herd on cache miss.

Monitoring requirements:

- Cache hit ratio.
- Memory usage.
- Evictions.
- Connection errors.

Interview defense:

"Redis is a performance optimization, not the source of truth. The system should degrade to PostgreSQL or direct fetching if Redis is temporarily unavailable."

## RabbitMQ

Current status:

Not required in the current demo version.

Production purpose:

RabbitMQ decouples slow ingestion and AI processing from user-facing requests.

Responsibilities:

- Queue ingestion jobs.
- Queue AI summary jobs.
- Retry failed jobs.
- Route poison messages to dead-letter queues.
- Buffer bursts of work.

Interactions:

- Scheduler publishes jobs.
- API may publish refresh requests.
- Workers consume jobs.
- Workers write results to PostgreSQL.

Bottlenecks:

- Queue depth growth.
- Slow workers.
- Poison messages repeatedly failing.
- Too many retries.

Scaling considerations:

- Add more worker replicas.
- Split queues by job type.
- Use priority queues if needed.
- Use dead-letter queues for debugging.

Failure scenarios:

- Worker crash mid-job.
- Duplicate delivery.
- Job timeout.
- Broker unavailable.

Monitoring requirements:

- Queue depth.
- Consumer count.
- Retry count.
- Dead-letter count.
- Job duration.

Interview defense:

"I would introduce RabbitMQ only after synchronous requests become too slow or unreliable. The queue is there to protect user latency and improve recovery."

## AI Processing Layer

Purpose:

The AI layer turns structured market data into explainable commentary.

Responsibilities:

- Build prompts from numeric signals.
- Call AI provider.
- Validate generated text.
- Fall back to deterministic rule engine.
- Track source of commentary.

Interactions:

- Reads market summary data.
- Uses OpenAI if configured.
- Returns or stores generated commentary.

Bottlenecks:

- AI provider latency.
- Token cost.
- Rate limits.
- Inconsistent outputs.

Scaling considerations:

- Cache summaries.
- Precompute summaries on schedule.
- Batch work where possible.
- Use cheaper models for concise commentary.

Failure scenarios:

- API key missing.
- Provider timeout.
- Rate limit.
- Low-quality or unsafe output.

Monitoring requirements:

- AI latency.
- Error rate.
- Fallback rate.
- Token usage.
- Summary generation count.

Interview defense:

"AI is treated as an optional interpretation layer. The deterministic pipeline still works without it, which keeps the product reliable."

## Ingestion Workers

Current status:

Market data is fetched on demand in the current implementation.

Production purpose:

Workers should fetch market data on a schedule, normalize it, compute indicators, and persist it.

Responsibilities:

- Consume ticker ingestion jobs.
- Call external data providers.
- Validate and clean OHLCV data.
- Compute indicators.
- Store snapshots.
- Emit metrics.

Interactions:

- RabbitMQ provides jobs.
- yfinance or another provider supplies data.
- PostgreSQL stores results.
- Redis cache is updated or invalidated.

Bottlenecks:

- External provider latency.
- Rate limiting.
- Large pandas computations.
- Slow database writes.

Failure scenarios:

- Provider returns empty data.
- Data schema changes.
- Worker crashes.
- Duplicate job delivery.

Monitoring requirements:

- Job success/failure rate.
- Fetch duration.
- Rows inserted.
- Duplicate conflict count.
- Dead-letter jobs.

Interview defense:

"Workers are the right place for repeated ingestion because user requests should not pay the cost of fetching and normalizing data every time."

## Observability Stack

Purpose:

Observability makes the system operationally explainable.

Responsibilities:

- Prometheus scrapes metrics.
- Grafana visualizes metrics.
- Loki stores logs.
- FastAPI exposes `/metrics`.
- Health endpoint shows service readiness.

Interactions:

- Backend emits metrics.
- Prometheus scrapes backend.
- Grafana reads Prometheus and Loki.
- Logs are shipped to Loki.

Bottlenecks:

- Log volume.
- Metrics cardinality.
- Missing dashboards.
- Misconfigured datasources.

Failure scenarios:

- Prometheus cannot scrape backend.
- Loki unavailable.
- Grafana datasource broken.
- Metrics names do not match dashboard queries.

Monitoring requirements:

- Scrape health.
- Dashboard panel errors.
- Backend request metrics.
- Custom operation histograms.
- Loki ingestion errors.

Interview defense:

"I added observability because production engineering is not just making the happy path work. I want to know when the system is slow, failing, or dependent on an unhealthy upstream."

## Scheduler And Cron Jobs

Current status:

Not required for the current on-demand demo.

Production purpose:

A scheduler triggers recurring ingestion, summary generation, and alert evaluation.

Responsibilities:

- Enqueue periodic ingestion jobs.
- Enqueue AI summary refreshes.
- Evaluate alert conditions.
- Track last successful run.

Interactions:

- Publishes jobs to RabbitMQ.
- Reads configuration from PostgreSQL.
- Emits scheduler metrics.

Bottlenecks:

- Too many scheduled tickers.
- Overlapping jobs.
- Provider rate limits.

Failure scenarios:

- Missed schedule.
- Duplicate schedule trigger.
- Clock drift.

Monitoring requirements:

- Last successful run.
- Jobs scheduled per interval.
- Scheduler errors.
- Late jobs.

Interview defense:

"The scheduler should not do heavy work itself. It should enqueue jobs and let workers handle execution."

---

# 7. Database Design

## Current Position

The current project does not require a database to run. It fetches market data on demand, computes indicators, and returns responses immediately.

That is acceptable for a demo because:

- It reduces setup complexity.
- There is no user-specific state yet.
- It avoids maintaining stale data.
- It keeps the architecture easy to explain.

For production, a database becomes valuable once we need history, caching beyond memory, watchlists, alerts, user accounts, or analytics.

## Why PostgreSQL

PostgreSQL is the best default choice because:

- Market data has structured fields.
- Users, watchlists, assets, and summaries have relationships.
- SQL supports time-window queries well.
- Indexing is mature.
- Transactions help with consistency.
- JSONB can still store flexible metadata when needed.

## Core Tables

Proposed schema:

```text
users
  id uuid primary key
  email text unique not null
  password_hash text not null
  created_at timestamptz not null
  updated_at timestamptz not null

assets
  id uuid primary key
  symbol text unique not null
  name text
  asset_type text not null
  provider text not null
  active boolean not null
  created_at timestamptz not null

market_candles
  id bigserial primary key
  asset_id uuid references assets(id)
  candle_time timestamptz not null
  interval text not null
  open numeric not null
  high numeric not null
  low numeric not null
  close numeric not null
  volume numeric
  provider text not null
  created_at timestamptz not null

market_indicators
  id bigserial primary key
  asset_id uuid references assets(id)
  candle_time timestamptz not null
  interval text not null
  pct_change numeric
  ma7 numeric
  volatility numeric
  trend text
  momentum text
  created_at timestamptz not null

ai_summaries
  id uuid primary key
  asset_id uuid references assets(id)
  summary_time timestamptz not null
  model text
  prompt_version text
  source text not null
  summary text not null
  input_hash text
  token_count integer
  latency_ms integer
  created_at timestamptz not null

cycle_events
  id bigserial primary key
  event_date date not null
  event_type text not null
  label text not null
  metadata jsonb
  created_at timestamptz not null

signal_overlays
  id bigserial primary key
  asset_id uuid references assets(id)
  event_date date not null
  volatility_spike boolean not null
  cycle_event_ids uuid[]
  score numeric
  explanation text
  created_at timestamptz not null

watchlists
  id uuid primary key
  user_id uuid references users(id)
  name text not null
  created_at timestamptz not null

watchlist_assets
  watchlist_id uuid references watchlists(id)
  asset_id uuid references assets(id)
  created_at timestamptz not null
  primary key (watchlist_id, asset_id)

jobs
  id uuid primary key
  job_type text not null
  status text not null
  payload jsonb not null
  attempts integer not null
  last_error text
  created_at timestamptz not null
  updated_at timestamptz not null
```

## Relationships

- One asset has many market candles.
- One asset has many indicator rows.
- One asset has many AI summaries.
- One user has many watchlists.
- One watchlist has many assets.
- Cycle events can be associated with overlay records.

## Indexing Strategy

Important indexes:

```sql
create unique index idx_assets_symbol on assets(symbol);
create unique index idx_candles_asset_time_interval
  on market_candles(asset_id, candle_time, interval);
create index idx_candles_time on market_candles(candle_time desc);
create index idx_indicators_asset_time
  on market_indicators(asset_id, candle_time desc);
create index idx_ai_summaries_asset_time
  on ai_summaries(asset_id, summary_time desc);
create index idx_cycle_events_date_type
  on cycle_events(event_date, event_type);
create index idx_jobs_status_type
  on jobs(status, job_type);
```

Why:

- Dashboard queries usually filter by ticker and time range.
- Latest snapshot queries need descending time indexes.
- Job processing needs fast lookup of pending jobs.
- Cycle overlays align by date.

## Normalization Vs Denormalization

Normalized:

- Assets separate from candles.
- Users separate from watchlists.
- AI summaries separate from market data.

Denormalized where useful:

- Store computed indicator values instead of recomputing every time.
- Store summary source and prompt version for auditability.
- Store overlay score for fast dashboard rendering.

Tradeoff:

- Normalization reduces duplication and improves data integrity.
- Denormalization improves read performance but requires careful invalidation.

## Query Optimization

Common query:

```sql
select *
from market_candles
where asset_id = $1
  and interval = '1d'
  and candle_time >= now() - interval '30 days'
order by candle_time asc;
```

Optimization:

- Composite index on `(asset_id, candle_time, interval)`.
- Limit time windows.
- Avoid selecting unused columns.
- Cache hot results in Redis.

## PostgreSQL Vs MongoDB

Why PostgreSQL fits better:

- The data is relational.
- Ticker/time queries are predictable.
- Strong indexing and constraints are useful.
- SQL is excellent for reporting and analytics.
- Transactions help maintain data integrity.

Where MongoDB could fit:

- Highly flexible document payloads.
- Rapidly changing event schemas.
- Storing raw provider responses.

Tradeoff:

"MongoDB would be acceptable for raw unstructured provider snapshots, but PostgreSQL is stronger as the main system of record because assets, candles, users, summaries, jobs, and watchlists have clear relationships."

---

# 8. API Design

## Current API Style

The backend exposes REST endpoints. REST is appropriate because:

- Resources are simple.
- Browser and dashboard integration is easy.
- Swagger documentation comes automatically through FastAPI.
- The project does not need GraphQL complexity.

## Sample Endpoints

Current/demonstrated endpoints:

```text
GET /health
GET /metrics
GET /market/btc
GET /market/tickers
GET /market/stock/{ticker}
GET /insights/btc
GET /insights/stock/{ticker}
GET /cycles/moon?days=30
GET /cycles/retrograde?days=30
GET /signals/overlay/{ticker}
```

Production extension:

```text
POST /auth/login
POST /auth/refresh
GET /users/me
GET /assets
GET /assets/{symbol}/candles
GET /assets/{symbol}/summary
GET /assets/{symbol}/signals
POST /watchlists
GET /watchlists
POST /watchlists/{id}/assets
DELETE /watchlists/{id}/assets/{symbol}
POST /alerts
GET /jobs/{id}
```

## Request Example

```http
GET /market/stock/AAPL HTTP/1.1
Host: api.example.com
Accept: application/json
```

## Response Example

```json
{
  "summary": {
    "ticker": "AAPL",
    "latest_close": 189.98,
    "daily_change_pct": 1.23,
    "ma7": 185.44,
    "high_30d": 192.11,
    "low_30d": 171.52,
    "avg_volume": 60123456,
    "volatility_30d": 24.7,
    "as_of": "2026-05-17T00:00:00Z"
  },
  "candles": [
    {
      "date": "2026-05-01",
      "open": 180.1,
      "high": 183.4,
      "low": 178.9,
      "close": 182.7,
      "volume": 55230000,
      "pct_change": 0.75,
      "ma7": 181.2,
      "volatility": 22.1
    }
  ],
  "meta": {
    "period": "30d",
    "interval": "1d",
    "data_points": 30,
    "fetched_at": "2026-05-17T10:00:00Z"
  }
}
```

## Authentication Flow

Current:

- No user authentication required for demo routes.

Production:

1. User logs in with email/password or OAuth.
2. API returns access token and refresh token.
3. Frontend stores access token safely according to deployment strategy.
4. Protected routes validate JWT.
5. Refresh token flow renews sessions.

JWT claims:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["user"],
  "exp": 1770000000
}
```

## Authorization

Authorization rules:

- Public market data can be anonymous.
- User watchlists require authentication.
- Admin/system routes require admin role.
- Job and alert data belongs to the requesting user.

## Rate Limiting

Strategy:

- IP-based limit for public endpoints.
- User-based limit for authenticated endpoints.
- Stricter limits on AI summary generation.
- Redis-backed counters.

Example:

```text
GET /market/*: 60 requests/min/IP
GET /insights/*: 20 requests/min/IP
POST /alerts: 10 requests/min/user
```

## Pagination

Use cursor or time-window pagination for historical data.

Example:

```text
GET /assets/AAPL/candles?interval=1d&from=2026-01-01&to=2026-05-17&limit=200
```

Why not offset pagination for time-series:

- Offset gets slower for large tables.
- Time windows map naturally to market data.
- Cursor/time-based pagination is more stable.

## Validation

Validation happens at multiple layers:

- Path parameters: ticker length and supported ticker list.
- Query parameters: days range, interval values.
- Response models: Pydantic schemas.
- Environment variables: settings layer.

## Error Handling

Error response shape:

```json
{
  "error": {
    "code": "UPSTREAM_DATA_ERROR",
    "message": "Unable to fetch market data",
    "request_id": "abc-123"
  }
}
```

Important status codes:

- 400: invalid ticker or bad parameters.
- 401: unauthenticated.
- 403: unauthorized.
- 404: no data found.
- 429: rate limited.
- 502: upstream provider failure.
- 503: service unavailable.

Interview defense:

"I prefer predictable error contracts. They make frontend handling easier and support better debugging."

---

# 9. Caching Strategy

## Why Caching Matters

Market dashboards repeatedly request the same popular tickers. Without caching:

- Each user request may hit yfinance.
- Latency depends on external provider response time.
- Provider rate limits become more likely.
- AI summaries may be regenerated unnecessarily.

Caching improves:

- Latency.
- Cost.
- Provider reliability.
- Dashboard user experience.

## Redis Usage

Proposed Redis keys:

```text
market:snapshot:BTC-USD:30d:1d
market:snapshot:AAPL:30d:1d
insight:BTC-USD:latest
cycles:moon:30
signals:overlay:AAPL:30d
ratelimit:ip:{ip}:{minute}
```

## TTL Strategy

Suggested TTLs:

```text
Health/status: no cache or very short TTL
Ticker list: 1 hour
Market snapshot: 60 seconds to 15 minutes depending on interval
AI summary: 15 minutes to 1 hour
Moon cycle metadata: 24 hours
Signal overlay: 15 minutes
Rate limit counters: 1 minute
```

Reasoning:

- Market data changes often, but a demo dashboard does not need tick-level refresh.
- AI summaries are expensive and can be reused until the underlying data changes.
- Astronomical cycle metadata changes slowly.

## Cache Invalidation

Approaches:

1. TTL-based invalidation
   - Simple and safe.
   - Slightly stale data is acceptable.

2. Event-based invalidation
   - Workers invalidate cache after new ingestion.
   - More accurate but more complex.

Best practical approach:

- Start with TTLs.
- Add event invalidation only for high-value keys.

## Performance Improvements

Expected benefits:

- Faster dashboard load.
- Fewer upstream calls.
- Lower AI token cost.
- Better resilience during provider slowness.

## Tradeoffs

Caching risks:

- Stale data.
- Extra infrastructure.
- Cache invalidation bugs.
- Memory usage.

Interview defense:

"I would not cache everything blindly. I would cache hot ticker responses and AI summaries first because they provide the highest latency and cost benefit."

---

# 10. Queue And Async Processing

## Why Async Processing Is Needed

Synchronous processing is acceptable for a demo. It is not ideal for production when:

- External APIs are slow.
- AI calls are expensive.
- Many tickers need scheduled refresh.
- Users should not wait for ingestion.
- Failures need retries.

Async processing separates user-facing latency from background work.

## RabbitMQ Flow

```text
Scheduler/API
  -> publish job to RabbitMQ
  -> worker consumes job
  -> worker calls external provider
  -> worker computes indicators
  -> worker writes PostgreSQL
  -> worker updates Redis
  -> worker emits metrics/logs
```

## Job Types

```text
market_ingestion
ai_summary_generation
cycle_overlay_generation
alert_evaluation
daily_report_generation
```

## Retry Strategy

Recommended:

- Retry transient provider failures.
- Exponential backoff.
- Max retry count.
- Dead-letter queue after repeated failure.

Example:

```text
Attempt 1: immediate
Attempt 2: 30 seconds later
Attempt 3: 2 minutes later
Attempt 4: 10 minutes later
Then DLQ
```

## Dead-Letter Queues

Dead-letter queues store jobs that repeatedly fail.

Why:

- Prevent infinite retry loops.
- Preserve failure context.
- Allow manual inspection.
- Protect worker capacity.

## Duplicate Processing

RabbitMQ can deliver jobs more than once. Workers must be idempotent.

Idempotency techniques:

- Unique DB constraints on `(asset_id, candle_time, interval)`.
- Upserts for market candle writes.
- Job id tracking.
- Input hash for AI summaries.

Interview defense:

"I assume background jobs can be retried and duplicated. The database write path must be idempotent so retries are safe."

## Failure Recovery

Scenarios:

- Worker crashes mid-job.
- Broker restarts.
- Provider times out.
- Database write fails.

Recovery:

- Message acknowledgment after successful processing only.
- Retry transient failures.
- DLQ poison jobs.
- Emit metrics and logs.

---

# 11. AI Workflow Architecture

## AI Processing Lifecycle

```text
Market data fetched
  -> Indicators computed
  -> Structured summary built
  -> Prompt generated
  -> AI provider called
  -> Output validated
  -> Commentary returned or stored
  -> Metrics emitted
```

## Summarization Pipeline

Inputs:

- Ticker.
- Latest close.
- Daily change.
- Volatility.
- Volatility shift.
- Trend.
- Momentum.
- Moving average position.
- Positive day rate.
- Price range.

Output:

- Concise market commentary.
- Commentary source: AI or rule engine.
- Optional metadata: model, latency, token count.

## Signal Extraction Logic

The deterministic layer should compute:

- Trend direction from recent closes.
- Momentum shift from recent percentage changes.
- Volatility shift from rolling windows.
- Price position relative to moving average.
- Positive session rate.
- Volatility spike flags.

Why:

These are explainable and inspectable.

## Prompt Orchestration

Good prompt qualities:

- Grounded in structured data.
- Requests concise commentary.
- Avoids unsupported claims.
- Explicitly says not to provide financial advice.
- Keeps output length bounded.

Example prompt:

```text
You are a market analyst. Using only the structured data below,
write 3 concise sentences explaining the recent market condition.
Do not give trading advice. Do not predict certainty.

Ticker: AAPL
Daily change: +1.2%
Volatility: 24.7%
Trend: bullish
Momentum: stable
Price vs MA7: above
```

## Token And Cost Optimization

Strategies:

- Send only computed summary, not full candle history.
- Use short prompts.
- Cache summaries.
- Precompute summaries on schedule.
- Fall back to rule engine for low-priority requests.
- Track token usage.

## AI Limitations

Limitations:

- AI can sound confident even when uncertainty is high.
- Provider latency can be unpredictable.
- Outputs may vary.
- It should not be the source of truth.
- It should not make financial recommendations.

## Fallback Behavior

Fallback is critical.

If OpenAI is unavailable:

- Use deterministic rule engine.
- Return commentary with `commentary_source = "rule_engine"`.
- Log the AI failure.
- Emit metric for fallback.

Interview defense:

"The AI layer is optional by design. The platform remains useful without the AI provider, which is important for reliability and demos."

---

# 12. Observability And Monitoring

## Observability Philosophy

Observability exists to answer:

- Is the API up?
- Which endpoints are slow?
- Are requests failing?
- Is yfinance slow or failing?
- Is AI generation slow or falling back?
- Are cycle computations expensive?
- Are logs reaching Loki?

## Logs

Log events:

- Request start/end.
- Upstream data failures.
- AI fallback events.
- Worker failures.
- Scheduler failures.
- Deployment startup.

Log fields:

```text
timestamp
level
service
environment
request_id
endpoint
ticker
latency_ms
error_code
message
```

## Metrics

Current metrics:

- FastAPI request metrics through Prometheus instrumentation.
- Custom market fetch duration.
- Custom AI insight duration.
- Custom cycle process duration.

Important production metrics:

```text
http_requests_total
http_request_duration_seconds
market_fetch_duration_seconds
ai_insight_duration_seconds
cycle_process_duration_seconds
worker_jobs_total
worker_job_duration_seconds
worker_job_failures_total
cache_hits_total
cache_misses_total
ai_fallback_total
```

## Traces

Current project does not require distributed tracing. If production complexity grows, OpenTelemetry could trace:

```text
frontend request -> API -> Redis -> PostgreSQL -> queue -> worker -> AI provider
```

Interview defense:

"I would add tracing only once there are multiple services and async hops. Metrics and structured logs are enough for the current architecture."

## Grafana Dashboards

Useful panels:

- Total API requests.
- Request rate by endpoint.
- Error rate.
- P95 latency.
- Market fetch duration.
- AI generation duration.
- AI fallback count.
- Cycle processing duration.
- Loki log stream.
- Docker/container health.

## Prometheus

Prometheus scrapes `/metrics`.

Prometheus responsibilities:

- Collect metrics.
- Store time-series data.
- Support Grafana queries.
- Enable alert rules.

## Loki Logging

Loki stores structured logs.

Why Loki:

- Integrates well with Grafana.
- Cheaper than heavy log indexing systems.
- Good for containerized app logs.

## Alerting Strategy

Alert examples:

```text
API 5xx rate > 5% for 5 minutes
P95 latency > 2 seconds for 10 minutes
Prometheus scrape failing for backend
AI fallback rate > 50% for 15 minutes
Market fetch failures > threshold
RabbitMQ dead-letter queue not empty
```

## Operational Debugging

Example workflow:

1. User reports dashboard is slow.
2. Check Grafana latency panel.
3. Identify slow endpoint.
4. Check logs in Loki by endpoint/request ID.
5. Check yfinance fetch duration.
6. Determine whether issue is API, provider, or frontend.
7. Apply fix or fallback.

Interview defense:

"Observability is one of the strongest parts of this project because it shows I am thinking about runtime behavior, not just implementation."

---

# 13. Security Design

## Current Security Posture

Current demo:

- Public dashboard.
- Public backend endpoints.
- No user-specific sensitive data.
- Optional OpenAI key stored in environment.
- Configurable CORS.

This is acceptable for a portfolio demo, but not enough for a user-facing SaaS product.

## JWT Authentication

Production flow:

```text
User logs in
  -> API verifies credentials
  -> API returns access token and refresh token
  -> Frontend sends access token with API calls
  -> Backend validates JWT on protected routes
```

Protected resources:

- Watchlists.
- Alerts.
- User settings.
- Saved summaries.

## Authorization

Roles:

```text
anonymous: public market data only
user: watchlists, alerts, saved views
admin: operational/admin routes
```

Authorization rules:

- Users can access only their own watchlists.
- Admin routes require admin role.
- Public market routes can remain anonymous with rate limits.

## API Protection

Controls:

- Input validation.
- Rate limiting.
- CORS allowlist.
- Request size limits.
- Timeouts for external calls.
- No secrets in frontend environment except public config.

## Secrets Management

Secrets:

- OpenAI API key.
- Database URL.
- Redis URL.
- RabbitMQ URL.
- JWT signing key.

Rules:

- Store in environment variables.
- Do not commit secrets.
- Rotate keys if exposed.
- Use deployment provider secret manager.

## Rate Limiting And Abuse Prevention

Risk:

- Public endpoints can be abused.
- AI endpoints can generate cost.
- External provider can rate-limit.

Controls:

- Redis-backed rate limiting.
- Stricter limits on AI endpoints.
- Cache popular responses.
- Require auth for expensive operations.

## Data Security

Current:

- No private user data.

Production:

- Hash passwords.
- Encrypt sensitive tokens.
- Use TLS.
- Keep audit logs.
- Apply least privilege DB credentials.

Interview defense:

"I would keep public market data open but protect expensive and user-specific features with authentication and rate limits."

---

# 14. Failure Handling And Reliability

## API Failures

Possible failures:

- Invalid input.
- External provider failure.
- AI provider failure.
- Internal exception.

Handling:

- Return structured error responses.
- Use 4xx for client errors.
- Use 5xx/502 for upstream errors.
- Log failures with context.
- Expose error rates in metrics.

## Retry Handling

Retry only when likely transient:

- Network timeout.
- 429 rate limit with backoff.
- Temporary provider failure.

Do not blindly retry:

- Invalid ticker.
- Bad request payload.
- Authentication failures.

## Timeout Handling

Set timeouts for:

- External market API calls.
- AI provider calls.
- Database queries.
- Queue job processing.

Reason:

Without timeouts, user requests and workers can hang indefinitely.

## Fallback Mechanisms

Existing:

- AI fallback to deterministic rule engine.

Production:

- Cache fallback if provider unavailable.
- Serve stale market data with freshness warning.
- Queue refresh job instead of blocking request.

## Worker Crashes

Handling:

- Acknowledge messages only after successful completion.
- Restart workers through container orchestration.
- Retry failed messages.
- Dead-letter repeated failures.

## Duplicate Processing

Handling:

- Use idempotent writes.
- Unique constraints.
- Job IDs.
- Upserts.

## Resilience Strategies

Practical strategy:

- Keep API stateless.
- Use cache for hot reads.
- Use queue for slow work.
- Use DB constraints for consistency.
- Use observability for detection.

Interview defense:

"I assume every external dependency can fail. The system should degrade gracefully instead of failing completely."

---

# 15. Scalability Analysis

## Current Scale Assumptions

Current version supports:

- Portfolio demo usage.
- Low concurrent users.
- Limited supported tickers.
- On-demand market fetching.
- Local observability.

This is honest and appropriate. It is not designed as a high-frequency trading system.

## Future Bottlenecks

Likely bottlenecks:

- yfinance latency and rate limits.
- AI provider latency and cost.
- Synchronous request processing.
- No durable market data store.
- Large chart payloads.
- Observability storage growth.

## Horizontal Scaling Opportunities

API:

- FastAPI is stateless.
- Run multiple backend replicas behind a load balancer.

Workers:

- Scale ingestion workers by queue depth.
- Scale AI workers separately.

Frontend:

- Static assets served through CDN.

## AI Processing Constraints

Constraints:

- Token cost.
- Rate limits.
- Provider latency.
- Non-deterministic output.

Mitigation:

- Cache outputs.
- Precompute summaries.
- Use fallback engine.
- Use shorter prompts.
- Track token cost.

## DB Scaling Considerations

Early stage:

- Single PostgreSQL instance.
- Good indexes.
- Short time-window queries.

Growth stage:

- Read replicas.
- Table partitioning.
- Materialized views.
- Archive old raw data.

## Caching Benefits

High-impact cache targets:

- Latest market snapshot.
- AI summary.
- Cycle metadata.
- Supported ticker list.

Expected impact:

- Lower latency.
- Lower provider dependency.
- Lower token cost.
- Better user experience.

Interview defense:

"The scaling path is incremental. I would not introduce all components on day one. I would add them when the bottleneck is observed."

---

# 16. Tradeoff Analysis

## Monolith Vs Microservices

Decision:

Start with a modular monolith.

Why:

- Small team/project.
- Easier deployment.
- Easier debugging.
- Lower operational overhead.
- Clear module boundaries still exist.

Alternative:

- Split API, ingestion, AI, auth, and analytics into microservices.

Why not now:

- Too much overhead for current scale.
- More networking and deployment complexity.
- Harder local development.

Accepted tradeoff:

- A modular monolith may become crowded later.
- But it is easier to extract services once real boundaries and load patterns are known.

Interview answer:

"I intentionally avoided microservices. The architecture is modular enough to split later, but the current scale benefits more from simplicity."

## PostgreSQL Vs MongoDB

Decision:

PostgreSQL for production system of record.

Why:

- Relational data model.
- Time-series queries by asset and timestamp.
- Strong constraints.
- SQL analytics.

Alternative:

- MongoDB for flexible documents.

Accepted tradeoff:

- PostgreSQL schema changes require migrations.
- MongoDB may be faster for flexible raw payload storage.

Interview answer:

"The core entities are relational. PostgreSQL gives stronger correctness and queryability. JSONB still lets me store flexible metadata when needed."

## Sync Vs Async Processing

Decision:

Current demo uses synchronous API calls. Production design adds async workers for slow repeated work.

Why sync initially:

- Simpler.
- Easier to demonstrate.
- No queue infrastructure required.

Why async later:

- Better reliability.
- Better latency.
- Better retry handling.
- Better provider isolation.

Accepted tradeoff:

- Current requests can be slower because external calls happen inline.

Interview answer:

"Synchronous fetching is acceptable for the demo. Once usage increases, ingestion and AI summary generation should move to workers."

## Simplicity Vs Scalability

Decision:

Prefer simple architecture until there is a real scaling signal.

Why:

- Overengineering slows delivery.
- Complexity needs operational justification.
- Most portfolio projects fail by adding fake complexity.

Accepted tradeoff:

- Some features need refactoring when scale grows.

Interview answer:

"I designed the growth path without pretending the demo needs every production component on day one."

## Caching Tradeoffs

Decision:

Use Redis later for hot responses and AI summaries.

Benefits:

- Lower latency.
- Lower cost.
- Fewer external calls.

Risks:

- Stale data.
- Cache invalidation complexity.
- Extra infrastructure.

Interview answer:

"I would cache where the business benefit is clear: hot ticker snapshots and AI summaries."

## AI Cost Vs Performance

Decision:

Use AI only for commentary and keep deterministic fallback.

Benefits:

- Better user explanation.
- Low risk to core data pipeline.
- Product differentiation.

Risks:

- Token cost.
- Latency.
- Provider outages.

Interview answer:

"AI improves interpretation, but the platform should still produce useful analysis without it."

## Real-Time Vs Near Real-Time

Decision:

Near real-time is enough.

Why:

- This is a market intelligence dashboard, not a trading engine.
- yfinance is not suitable for high-frequency trading.
- Near real-time reduces cost and complexity.

Interview answer:

"I avoid claiming real-time trading capability. The system is designed for market intelligence, not order execution."

---

# 17. Cost Optimization

## Infrastructure Costs

Current low-cost setup:

- Frontend on free static hosting.
- Backend on Hugging Face Spaces or similar free container hosting.
- Observability local through Docker.
- No database required for demo.

Production costs:

- Backend compute.
- PostgreSQL.
- Redis.
- RabbitMQ.
- Observability retention.
- AI usage.

## AI Token Costs

Controls:

- Short prompts.
- Structured inputs only.
- Cache summaries.
- Precompute on schedule.
- Use fallback engine.
- Avoid generating summaries on every page refresh.

## Caching Impact

Caching reduces:

- Repeated yfinance calls.
- Repeated AI calls.
- Dashboard latency.
- Risk of provider rate limits.

## Worker Optimization

Worker cost controls:

- Limit supported tickers initially.
- Schedule ingestion based on market hours.
- Avoid unnecessary refreshes.
- Use backoff after failures.

## API Cost Reduction

Strategies:

- Cache hot endpoints.
- Use pagination.
- Compress responses.
- Precompute common summaries.
- Rate-limit expensive endpoints.

Interview defense:

"The biggest controllable cost is AI. I would treat AI summaries like generated assets that can be cached, not something to regenerate on every request."

---

# 18. Production Deployment

## Docker Setup

Current setup:

- Backend Dockerfile.
- Frontend Dockerfile.
- Docker Compose orchestrates backend, frontend, Prometheus, Loki, and Grafana.

Why Docker:

- Consistent environment.
- Easier demo.
- Avoids local dependency mismatch.
- Shows deployment maturity.

## Deployment Architecture

Simple production target:

```text
Cloudflare/Vercel frontend
  -> HTTPS API backend
  -> PostgreSQL
  -> Redis
  -> RabbitMQ
  -> Workers
  -> Observability
```

For zero-cost demo:

```text
Cloudflare Pages frontend
  -> Hugging Face Spaces backend
  -> local Docker observability demo
```

## Reverse Proxy

Production can use Nginx or platform routing.

Responsibilities:

- TLS termination.
- Route `/api` to backend.
- Serve static assets.
- Apply request size limits.

## CI/CD Basics

Recommended pipeline:

```text
Pull request
  -> backend lint/test
  -> frontend type-check/build
  -> Docker build check
  -> merge
  -> deploy frontend
  -> deploy backend
```

## Environment Separation

Environments:

- Local.
- Preview/staging.
- Production.

Separate:

- API URLs.
- CORS origins.
- Database URLs.
- AI keys.
- Logging destinations.

## Monitoring In Production

Production checks:

- `/health` for backend.
- `/metrics` scrape.
- Grafana dashboards.
- Error alerts.
- Deployment logs.
- Uptime checks.

Interview defense:

"Deployment is not just hosting. It includes configuration, health checks, logs, metrics, and environment separation."

---

# 19. Future Improvements

## Vector Search

Use case:

- Search previous AI summaries.
- Retrieve similar market conditions.
- Build memory of past market explanations.

Tradeoff:

- Adds embedding cost and vector storage.
- Useful only after enough historical summaries exist.

## Recommendation Systems

Use case:

- Recommend assets to watch based on volatility, trend, or user interest.

Tradeoff:

- Requires user behavior data.
- Needs careful disclaimer boundaries.

## Better Observability

Add:

- OpenTelemetry traces.
- Request IDs across frontend/API/workers.
- AI fallback dashboards.
- Queue and worker dashboards.

## Advanced Analytics

Add:

- Rolling correlations.
- Sector comparison.
- Anomaly detection.
- Backtesting views for experimental overlays.

## Streaming Architecture

Add later:

- WebSockets or Server-Sent Events.
- Streaming provider integration.
- Real-time dashboard updates.

Tradeoff:

- Higher complexity.
- More infrastructure.
- Not needed for current near-real-time use case.

## RBAC

Add:

- Admin role.
- User role.
- Premium features.
- Team workspaces.

## Multi-Tenancy

Add only if needed:

- Tenant IDs.
- Tenant-level limits.
- Isolated watchlists and alerts.
- Billing integration.

Interview defense:

"The future roadmap is incremental. I would not add multi-tenancy or streaming until the product actually needs them."

---

# 20. Interview Defense Questions

## Architecture Decisions

1. Why did you choose FastAPI?

FastAPI is a good fit because the backend is API-first, Python has strong data tooling, and Pydantic gives clean validation. It also provides automatic Swagger docs, which helps both development and demo readiness.

2. Why did you use Next.js for the frontend?

Next.js gives a structured React application with good build tooling, routing, and deployment support. For this project, it is mainly a dashboard frontend, so Next.js provides enough structure without requiring a separate frontend framework ecosystem.

3. Why not build this as microservices?

The current scale does not justify microservices. I chose a modular monolith because it is simpler to run, debug, and deploy. The boundaries are still clear enough that ingestion or AI processing could be extracted later.

4. What is the most important architectural decision?

Keeping the AI layer optional. The deterministic pipeline still works without OpenAI, which improves reliability and makes the system demo-safe.

5. What is the main differentiator?

It combines market data, AI commentary, experimental cyclical overlays, and observability. Many portfolio dashboards stop at charts; this also shows operational thinking.

## Backend Design

6. How is the backend organized?

The backend separates routers, services, schemas, configuration, and observability. Routers expose HTTP endpoints, services handle business logic, schemas define response contracts, and observability is configured centrally.

7. Why keep calculations in the backend?

The backend should be the source of truth for market calculations. If the frontend calculated indicators independently, different clients could drift or duplicate logic.

8. What happens when yfinance fails?

The API returns an upstream error and logs the failure. In production, I would serve stale cached data if available and enqueue a refresh job.

9. How would you improve backend latency?

First add Redis caching for hot ticker responses, then precompute market snapshots through scheduled workers, and finally persist snapshots in PostgreSQL.

10. Why expose `/health` and `/metrics`?

`/health` supports readiness checks and deployment validation. `/metrics` exposes operational data for Prometheus and Grafana.

## Data And Database

11. Why does the current project not need a database?

The current version is stateless and demo-focused. It fetches current market data on demand and does not store user-specific state.

12. When would you add PostgreSQL?

When I need durable historical data, user accounts, watchlists, alerts, saved AI summaries, or auditability.

13. Why PostgreSQL over MongoDB?

The core entities are relational and time-indexed. PostgreSQL gives constraints, joins, indexing, and SQL analytics. JSONB still supports flexible metadata.

14. What indexes matter most?

For market candles, `(asset_id, candle_time, interval)` is the key index because most dashboard queries fetch a ticker over a time range.

15. How do you prevent duplicate candle inserts?

Use a unique constraint on `(asset_id, candle_time, interval)` and write with upsert semantics.

## Caching

16. What would you cache first?

Latest ticker snapshots and AI summaries, because they are frequently requested and expensive relative to cache reads.

17. How do you choose TTLs?

TTL depends on data volatility and business needs. Market snapshots can use short TTLs; AI summaries can last longer; cycle metadata can last much longer.

18. What is the risk of caching?

Serving stale data. I would expose data freshness and use TTLs plus invalidation after ingestion jobs.

19. Is Redis the source of truth?

No. Redis is a performance layer. PostgreSQL or the external provider remains the source of truth depending on architecture stage.

20. How do you handle cache stampede?

Use short locking, stale-while-revalidate, or have only one worker refresh a missing hot key while others receive stale data.

## Queues And Workers

21. Why add RabbitMQ?

To decouple slow external API and AI work from user-facing request latency. It also gives retries, backpressure, and dead-letter handling.

22. Why not use a queue immediately?

It adds operational complexity. The demo can run synchronously. I would add a queue when latency, retries, or scheduled ingestion become real needs.

23. What makes a worker idempotent?

It can safely process the same job more than once without duplicating data or corrupting state. Unique constraints and upserts are common techniques.

24. What goes to the dead-letter queue?

Jobs that fail repeatedly after the retry limit, such as poison messages or persistent provider errors.

25. How do you scale workers?

Scale worker replicas based on queue depth, job duration, and provider rate limits.

## AI Systems

26. What role does AI play?

AI is an interpretation layer. It summarizes structured market signals into human-readable commentary. It does not replace deterministic calculations.

27. How do you reduce hallucination?

Constrain the prompt to structured inputs, ask for concise commentary, avoid unsupported claims, and keep deterministic calculations outside the model.

28. What happens if OpenAI is down?

The system falls back to a rule engine and returns a valid response with the commentary source marked as rule-based.

29. How do you reduce AI cost?

Use short prompts, cache summaries, precompute on schedule, and send only computed indicators rather than raw candle history.

30. How do you monitor AI reliability?

Track latency, error rate, fallback rate, token usage, and summary generation count.

## Observability

31. Why is observability important in this project?

Because the system depends on external data and AI providers. Observability helps distinguish whether issues are in the API, upstream provider, AI layer, or frontend.

32. What metrics do you track?

Request count, latency, error rate, market fetch duration, AI insight duration, cycle processing duration, and eventually cache hit rate and worker job metrics.

33. Why use Prometheus?

Prometheus is a standard metrics system with strong Grafana support and works well with containerized services.

34. Why use Loki?

Loki integrates with Grafana and is lightweight for log aggregation compared with heavier indexing systems.

35. What would you alert on?

High 5xx rate, high P95 latency, backend scrape failure, high AI fallback rate, market fetch failures, and non-empty dead-letter queues.

## Security

36. Why is there no auth in the current demo?

The current demo has no private user data. Public market data endpoints can be unauthenticated. User-specific features would require authentication.

37. How would you add authentication?

JWT-based login with access and refresh tokens. Protected routes for watchlists, alerts, and user settings.

38. How do you protect AI endpoints from abuse?

Rate-limit them, require authentication for expensive operations, cache summaries, and track token usage.

39. How do you manage secrets?

Environment variables or platform secret managers. Never commit API keys, database URLs, or JWT secrets.

40. What CORS policy would you use in production?

Use an explicit allowlist for deployed frontend domains instead of allowing all origins.

## Scalability

41. What is the first bottleneck?

External market data fetching is likely the first bottleneck because it is synchronous and provider-dependent.

42. How would you scale the API?

Keep it stateless, add multiple replicas, use a load balancer, and move slow work to workers.

43. How would you scale market ingestion?

Use scheduled jobs, RabbitMQ, worker replicas, provider-aware rate limits, and PostgreSQL upserts.

44. How would you scale historical queries?

Use proper indexes, time-window queries, table partitioning if needed, and cached materialized views for expensive aggregations.

45. Would you use streaming?

Not initially. This is a market intelligence platform, not a high-frequency trading system. Streaming is a future improvement if real-time updates become a core requirement.

## Failure Handling

46. What if yfinance returns empty data?

Return a controlled error, log it, increment failure metrics, and in production serve stale cached data if available.

47. What if Redis is down?

The API should bypass cache and read from PostgreSQL or fetch directly, with degraded latency but continued functionality.

48. What if PostgreSQL is down?

User-specific and historical features fail. Public cached reads may still work temporarily if Redis has data. Alerting should fire quickly.

49. What if RabbitMQ is down?

New async jobs cannot be queued. The API can still serve cached or existing data, but ingestion freshness may degrade.

50. What if AI output is low quality?

Keep prompts constrained, validate output length and content, allow fallback to rule engine, and never present AI commentary as financial advice.

## Product And Business

51. What is the business value?

The system reduces the time needed to understand market conditions by combining data, indicators, AI commentary, and operational transparency.

52. Is the cyclical overlay a prediction engine?

No. It is an experimental metadata overlay for pattern exploration. It can highlight interesting windows but does not guarantee future performance.

53. How would you explain the project in one minute?

"This is an AI-powered market intelligence platform. It ingests market data, computes indicators, generates AI or rule-based commentary, visualizes price and volatility, adds experimental cycle overlays, and includes Prometheus, Grafana, and Loki observability so the system can be operated like a real service."

54. What would you improve first?

I would finish production deployment, verify observability dashboards, and add caching before adding more features.

55. What is the biggest limitation?

The current demo relies on on-demand external data fetching. For production, I would add durable storage, caching, and scheduled ingestion.

---

# Closing Interview Narrative

If asked to summarize the architecture, use this:

"I designed the platform as a practical modular system. The current version is intentionally lean: FastAPI owns data ingestion, calculations, AI commentary, cycle metadata, and observability; Next.js renders the dashboard; Docker Compose runs the full local platform with Prometheus, Grafana, and Loki. For production, I would add PostgreSQL for durable history, Redis for hot caches and rate limits, and RabbitMQ workers for ingestion and AI processing. The key design principle is that every added component must solve a real operational problem, not just make the diagram look impressive."

If asked what makes it production-aware:

"Health checks, metrics, logs, Docker orchestration, environment-based configuration, AI fallback behavior, controlled error handling, and a clear scaling path."

If asked what you would not claim:

"I would not claim guaranteed prediction or high-frequency trading capability. This is a market intelligence and exploratory analytics platform. The cyclical overlay is clearly experimental."

