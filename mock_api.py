import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import random
import datetime
import pandas as pd
import numpy as np
import re

# --------------------------------------------------------------------------
# 1. FASTAPI
# --------------------------------------------------------------------------
app = FastAPI(
    title="Stock Advisor Chatbot API",
    description="API for stock advisory chatbot, combining price forecast and qualitative analysis.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------
# 2. PYDANTIC MODELS
# --------------------------------------------------------------------------
class ChatbotQuery(BaseModel):
    userId: str = Field(..., example="user-123", description="ID user")
    queryText: str = Field(..., example="FPT price forecast next week?", description="Original User Question")

class PricePrediction(BaseModel):
    date: datetime.date = Field(..., example="2025-08-12")
    price: float = Field(..., example=136500.5)

class Headline(BaseModel):
    title: str = Field(..., example="FPT Software signs digital transformation contract worth 100 million USD")
    source: str = Field(..., example="CafeF")
    url: str = Field(..., example="https://cafef.vn/du-lieu/hose/fpt-cong-ty-co-phan-fpt.chn")
    publishedDate: datetime.date = Field(..., example="2025-08-10")

class ForecastData(BaseModel):
    currentPrice: float = Field(..., example=135000.0)
    predictedPrices: List[PricePrediction]
    trend: str = Field(..., example="Slight increase")

class QualitativeAnalysis(BaseModel):
    sentiment: str = Field(..., example="Positive")
    keyHeadlines: List[Headline]

class Summary(BaseModel):
    title: str = Field(..., example="Summary of comments for FPT")
    text: str
    confidence: str = Field(..., example="High")

class ChatbotResponse(BaseModel):
    responseId: str
    request: Dict[str, Any]
    forecastData: Optional[ForecastData] = None
    qualitativeAnalysis: Optional[QualitativeAnalysis] = None
    summary: Summary
    suggestedQuestions: List[str]

# --------------------------------------------------------------------------
# 3. MODULE BACKEND
# --------------------------------------------------------------------------
MOCK_NEWS_DB = {
    "FPT": [
        {"title": "FPT Software signs $100 million digital transformation contract with US partner", "sentiment": "positive"},
        {"title": "FPT revenue grew 20% in the second quarter, exceeding the set plan", "sentiment": "positive"},
        {"title": "slightly", "sentiment": "neutral"},
    ],
    "VIC": [
        {"title": "VinFast prepares to launch new electric car model in European market", "sentiment": "positive"},
        {"title": "Vingroup announced plans to build a new urban area in Hung Yen", "sentiment": "positive"},
        {"title": "VIC's real estate profit shows signs of slowing down", "sentiment": "negative"},
    ],
    "VCB": [
        {"title": "Vietcombank honored as 'Best Bank in Vietnam' for 5 consecutive years", "sentiment": "positive"},
        {"title": "VCB credit growth is stable, NIM is improved", "sentiment": "positive"},
        {"title": "The State Bank may increase operating interest rates, affecting the banking industry.", "sentiment": "neutral"},
    ]
}
SUPPORTED_SYMBOLS = list(MOCK_NEWS_DB.keys())

def mock_transformer_prediction(symbol: str, days: int) -> ForecastData:
    """Simulates calling the Transformer model to forecast prices."""
    if symbol == "FPT": base_price = 135000
    elif symbol == "VIC": base_price = 45000
    elif symbol == "VCB": base_price = 92000
    else: base_price = 50000

    prices = []
    current_price = base_price
    start_date = datetime.date.today() + datetime.timedelta(days=1)

    for i in range(days):
        # Generate random fluctuations
        change_percent = random.uniform(-0.015, 0.02) # Fluctuation from -1.5% to +2%
        current_price *= (1 + change_percent)
        prices.append(
            PricePrediction(
                date=start_date + datetime.timedelta(days=i),
                price=round(current_price, -2) # Round to hundreds
            )
        )
    
    # Identify the trend
    final_price = prices[-1].price
    if final_price > base_price * 1.03: trend = "Strong increase"
    elif final_price > base_price: trend = "Slight increase"
    elif final_price < base_price * 0.97: trend = "Sharp decrease"
    elif final_price < base_price: trend = "Mitigate"
    else: trend = "Go sideways"

    return ForecastData(
        currentPrice=base_price,
        predictedPrices=prices,
        trend=trend
    )

def mock_qualitative_analysis(symbol: str) -> QualitativeAnalysis:
    """Simulates news gathering and analysis."""
    news_items = MOCK_NEWS_DB.get(symbol, [])
    if not news_items:
        return QualitativeAnalysis(sentiment="Neutral", keyHeadlines=[])
        
    headlines = []
    positive_count = 0
    for i, item in enumerate(random.sample(news_items, k=min(len(news_items), 2))):
        headlines.append(
            Headline(
                title=item["title"],
                source=random.choice(["CafeF", "Vietstock", "VnExpress"]),
                url=f"https://mock-news.com/{symbol.lower()}/article-{i}",
                publishedDate=datetime.date.today() - datetime.timedelta(days=random.randint(1, 10))
            )
        )
        if item["sentiment"] == "positive":
            positive_count += 1

    sentiment = "Positive" if positive_count >= len(headlines) / 2 else "Neutral"
    return QualitativeAnalysis(sentiment=sentiment, keyHeadlines=headlines)


def mock_reasoning_module(forecast: ForecastData, analysis: QualitativeAnalysis, symbol: str) -> Summary:
    """Simulate the synthesis module, give final judgment."""
    trend_text = forecast.trend.lower()
    sentiment_text = analysis.sentiment.lower()
    
    text = f"For code stock {symbol}, "
    confidence = "Medium"

    # Xây dựng nhận định dựa trên quy tắc (rule-based)
    if "increase" in trend_text and "positive" in sentiment_text:
        text += f"The {trend_text} trend is reinforced by fundamental information {sentiment_text} from the market."
        text += f"Our model predicts that the price may move towards the {forecast.predictedPrices[-1].price:,.0f} zone. This is a noteworthy signal."
        confidence = "High"
    elif "reduce" in trend_text and "negative" in sentiment_text:
        text += f"The stock may face correction pressure. Both technical analysis (trend {trend_text}) and market news are unfavorable."
        text += "Investors should be cautious."
        confidence = "High"
    elif "increase" in trend_text and "positive" not in sentiment_text:
        text += f"Technical analysis shows {trend_text} signal, however fundamentals do not really support this bullish momentum. "
        text += "Need to observe more trading sessions to confirm the trend."
        confidence = "Medium"
    else: # Other cases
        text += f"the forecasting model shows the trend {trend_text}. There is not much sudden news affecting the stock price at the moment."
        text += " Price may fluctuate around the current price range."
        confidence = "Short"

    return Summary(
        title=f"Summary for {symbol}",
        text=text,
        confidence=confidence
    )

def parse_query(query: str) -> Dict[str, Any]:
    """Simple function to extract entities from a question."""
    # Find stock symbol (3 uppercase letters)
    symbol_match = re.search(r'\b([A-Z]{3})\b', query)
    symbol = symbol_match.group(1) if symbol_match else None
    
    # Find the number of days
    days = 7 # Default is 1 week
    if "Tomorrow" in query: days = 1
    elif "3 days" in query: days = 3
    elif "next week" in query: days = 7
    elif "2 weeks" in query: days = 14
        
    return {"symbol": symbol, "days": days, "intent": "price_forecast"}

# --------------------------------------------------------------------------
# 4. API Endpoint Definition
# --------------------------------------------------------------------------
@app.post("/api/v1/chatbot/query", response_model=ChatbotResponse)
async def handle_chatbot_query(query: ChatbotQuery):
    """
    The main endpoint handles questions from the chatbot.

    - **Receive** questions from users.
    - **Analyze** to find stock codes and intents.
    - **Call** backend modules (forecasts, news analysis).
    - **Aggregate** and return a structured response.
    """

    #1. Parse the query to extract entities
    entities = parse_query(query.queryText)
    symbol = entities.get("symbol")
    days = entities.get("days", 7)

    if not symbol or symbol not in SUPPORTED_SYMBOLS:
        raise HTTPException(
            status_code=400,
            detail=f"The stock code in question was not found or does not support it. Supported codes: {', '.join(SUPPORTED_SYMBOLS)}"
        )
    
    # 2. Call backend modules (simulation)
    forecast_data = mock_transformer_prediction(symbol, days)
    qualitative_data = mock_qualitative_analysis(symbol)
    
    # 3. Call the synthesis module to create the statement
    summary_data = mock_reasoning_module(forecast_data, qualitative_data, symbol)
    
    # 4. Package and return the response
    response = ChatbotResponse(
        responseId=f"resp-{random.randint(1000, 9999)}",
        request={"stock_symbol": symbol, "days_to_predict": days},
        forecastData=forecast_data,
        qualitativeAnalysis=qualitative_data,
        summary=summary_data,
        suggestedQuestions=[
            f"Compare {symbol} with another code?",
            f"Financial Summary of {symbol}",
            f"Technical analysis for {symbol}"
        ]
    )
    
    return response

@app.get("/", include_in_schema=False)
def root():
    return {"message": "Welcome to the Stock Advisor API! Visit /docs for documentation."}

# --------------------------------------------------------------------------
# 5. RUN SERVER
# --------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("mock_api:app", host="127.0.0.1", port=8000, reload=True)