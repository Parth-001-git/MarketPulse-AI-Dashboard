from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 7860

    # CORS
    # For production, set this to your Vercel URL, e.g. ["https://my-dashboard.vercel.app"]
    # We default to ["*"] to ensure the deployed frontend can connect out-of-the-box.
    ALLOWED_ORIGINS: List[str] = ["*"]

    # yfinance defaults
    BTC_TICKER: str = "BTC-USD"
    DEFAULT_STOCK_TICKER: str = "AAPL"
    HISTORY_PERIOD: str = "30d"
    HISTORY_INTERVAL: str = "1d"

    # AI commentary (optional — leave empty to use rule engine)
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
