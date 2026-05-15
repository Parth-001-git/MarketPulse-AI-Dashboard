# ─── Stage 1: Base ────────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# ─── Stage 2: Dependencies ────────────────────────────────────────────────────
FROM base AS deps

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# ─── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM deps AS runtime

COPY . .

# Create non-root user for security
RUN addgroup --system --gid 1001 fastapi \
    && adduser --system --uid 1001 fastapi

USER fastapi

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
