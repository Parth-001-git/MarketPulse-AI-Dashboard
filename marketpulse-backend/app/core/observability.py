import logging
import logging_loki
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Histogram
import os

# Custom Metrics
MARKET_FETCH_DURATION = Histogram(
    "market_fetch_duration_seconds",
    "Time spent fetching and processing market data",
    ["ticker"]
)
AI_INSIGHT_DURATION = Histogram(
    "ai_insight_duration_seconds",
    "Time spent generating AI insight",
    ["ticker", "source"]
)
CYCLE_PROCESS_DURATION = Histogram(
    "cycle_process_duration_seconds",
    "Time spent calculating cyclical signals",
    ["ticker"]
)

def setup_observability(app):
    # Setup Prometheus Instrumentator
    Instrumentator(
        should_group_status_codes=False,
        should_ignore_untemplated=True,
        should_instrument_requests_inprogress=True,
        inprogress_name="inprogress_requests",
        inprogress_labels=True,
    ).instrument(app).expose(app, include_in_schema=False, should_gzip=True)

    # Setup Loki Logging
    loki_url = os.getenv("LOKI_URL", "http://loki:3100/loki/api/v1/push")
    
    try:
        logging_loki.emitter.LokiEmitter.level_tag = "level"
        loki_handler = logging_loki.LokiHandler(
            url=loki_url,
            tags={"application": "market-intelligence-api", "env": "production"},
            version="1",
        )
        
        # Add handler to root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)
        # Avoid duplicate handlers if reloading
        if not any(isinstance(h, logging_loki.LokiHandler) for h in root_logger.handlers):
            root_logger.addHandler(loki_handler)
            
        logging.info("Loki logging handler configured successfully.")
    except Exception as e:
        logging.error(f"Failed to configure Loki logging: {e}")
