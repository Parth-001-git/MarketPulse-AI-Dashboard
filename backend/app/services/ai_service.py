"""
AI Commentary Service.
Tries OpenAI first; falls back to a deterministic rule engine if key is absent.
"""

from __future__ import annotations
import os
import logging
from typing import Optional
from app.core.observability import AI_INSIGHT_DURATION

logger = logging.getLogger(__name__)


# ─── Deterministic Rule Engine ────────────────────────────────────────────────

def _rule_engine_commentary(
    ticker: str,
    daily_change: float,
    volatility: float,
    vol_shift: float,
    trend: str,
    momentum: str,
    ma_position: str,
    positive_day_rate: float,
    price_range_pct: float,
) -> str:
    """
    Deterministic commentary generator.
    Produces coherent, context-aware market summaries without any external API.
    """
    parts: list[str] = []
    asset = "Bitcoin" if "BTC" in ticker.upper() else ticker.upper()

    # ── Trend opener ──────────────────────────────────────────────────
    if trend == "bullish" and daily_change > 1.5:
        parts.append(f"{asset} posted a strong bullish session with {daily_change:+.1f}% daily gain.")
    elif trend == "bullish":
        parts.append(f"{asset} maintained a mild bullish tone with {daily_change:+.1f}% on the day.")
    elif trend == "bearish" and daily_change < -1.5:
        parts.append(f"{asset} faced significant selling pressure, falling {daily_change:.1f}% intraday.")
    elif trend == "bearish":
        parts.append(f"{asset} closed mildly in the red, down {daily_change:.1f}% for the session.")
    else:
        parts.append(f"{asset} traded sideways with a modest {daily_change:+.1f}% move.")

    # ── Volatility commentary ─────────────────────────────────────────
    if vol_shift > 5:
        parts.append(f"Volatility spiked sharply by {vol_shift:.1f}%, signalling elevated market uncertainty.")
    elif vol_shift > 2:
        parts.append(f"Volatility expanded moderately, indicating increased short-term risk.")
    elif vol_shift < -3:
        parts.append(f"Volatility compressed, suggesting a calmer price regime ahead.")
    else:
        if volatility > 60:
            parts.append(f"Annualised volatility remains elevated at {volatility:.1f}%, consistent with a high-risk environment.")
        elif volatility > 35:
            parts.append(f"Volatility sits at a moderate {volatility:.1f}%, reflecting typical market fluctuations.")
        else:
            parts.append(f"Volatility is subdued at {volatility:.1f}%, indicating a low-risk price regime.")

    # ── Momentum and MA commentary ────────────────────────────────────
    if momentum == "accelerating" and ma_position == "above":
        parts.append("Short-term momentum is accelerating above the 7-day moving average — bullish bias confirmed.")
    elif momentum == "decelerating" and ma_position == "below":
        parts.append("Momentum is weakening below the 7-day MA, reinforcing bearish near-term sentiment.")
    elif ma_position == "above":
        parts.append("Price holds above the 7-day moving average, preserving the short-term uptrend structure.")
    elif ma_position == "below":
        parts.append("Price is trading below the 7-day moving average, a sign of short-term weakness.")
    else:
        parts.append("Price action remains in close proximity to its 7-day moving average.")

    # ── Win-rate / session quality ─────────────────────────────────────
    if positive_day_rate > 0.65:
        parts.append(f"With {positive_day_rate*100:.0f}% positive sessions over 30 days, bulls have maintained control.")
    elif positive_day_rate < 0.40:
        parts.append(f"Only {positive_day_rate*100:.0f}% of sessions closed positive — bears have dominated recent price action.")

    # ── Closing outlook ───────────────────────────────────────────────
    if trend == "bullish" and volatility < 40:
        parts.append("Overall, the setup favours continuation if buying volume sustains.")
    elif trend == "bearish" and volatility > 50:
        parts.append("Caution is warranted — elevated volatility in a downtrend can amplify downside risk.")
    elif trend == "neutral":
        parts.append("The market appears to be in a consolidation phase; a directional breakout may follow.")

    return " ".join(parts)


# ─── OpenAI Commentary (optional) ────────────────────────────────────────────

def _openai_commentary(prompt: str, api_key: str) -> Optional[str]:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a senior quantitative analyst. Generate concise, professional market commentary "
                        "in 3-4 sentences. Be factual, data-driven, and avoid speculation. "
                        "Do not use bullet points. Write in flowing prose."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=220,
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("OpenAI call failed: %s — falling back to rule engine.", exc)
        return None


# ─── Public Interface ─────────────────────────────────────────────────────────

def generate_commentary(
    ticker: str,
    daily_change: float,
    volatility: float,
    vol_shift: float,
    trend: str,
    momentum: str,
    ma_position: str,
    positive_day_rate: float,
    price_range_pct: float,
) -> tuple[str, str]:
    """
    Returns (commentary_text, source) where source is 'openai' or 'rule_engine'.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    logger.info(f"Generating AI insight for {ticker}")

    if api_key:
        prompt = (
            f"Asset: {ticker}\n"
            f"Daily change: {daily_change:+.2f}%\n"
            f"Annualised volatility: {volatility:.1f}%\n"
            f"Volatility shift (recent vs prior): {vol_shift:+.1f}%\n"
            f"Overall trend: {trend}\n"
            f"Momentum: {momentum}\n"
            f"Price vs MA(7): {ma_position}\n"
            f"Positive session rate (30d): {positive_day_rate*100:.0f}%\n"
            f"30-day price range: {price_range_pct:.1f}%\n\n"
            "Generate a professional 3-4 sentence market commentary."
        )
        with AI_INSIGHT_DURATION.labels(ticker=ticker, source="openai").time():
            text = _openai_commentary(prompt, api_key)
            if text:
                return text, "openai"

    with AI_INSIGHT_DURATION.labels(ticker=ticker, source="rule_engine").time():
        text = _rule_engine_commentary(
            ticker, daily_change, volatility, vol_shift,
            trend, momentum, ma_position, positive_day_rate, price_range_pct,
        )
    return text, "rule_engine"
