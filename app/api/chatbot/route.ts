import { NextRequest } from "next/server";

const MOCK_NEWS_DB = {
  FPT: [
    { title: "FPT Software signs $100 million digital transformation contract with US partner", sentiment: "positive" },
    { title: "FPT revenue grew 20% in the second quarter, exceeding the set plan", sentiment: "positive" },
    { title: "slightly", sentiment: "neutral" },
  ],
  VIC: [
    { title: "VinFast prepares to launch new electric car model in European market", sentiment: "positive" },
    { title: "Vingroup announced plans to build a new urban area in Hung Yen", sentiment: "positive" },
    { title: "VIC's real estate profit shows signs of slowing down", sentiment: "negative" },
  ],
  VCB: [
    { title: "Vietcombank honored as 'Best Bank in Vietnam' for 5 consecutive years", sentiment: "positive" },
    { title: "VCB credit growth is stable, NIM is improved", sentiment: "positive" },
    { title: "The State Bank may increase operating interest rates, affecting the banking industry.", sentiment: "neutral" },
  ],
};
const SUPPORTED_SYMBOLS: Array<keyof typeof MOCK_NEWS_DB> = Object.keys(MOCK_NEWS_DB) as Array<keyof typeof MOCK_NEWS_DB>;

function parseQuery(query: string) {
  const symbolMatch = query.match(/\b([A-Z]{3})\b/);
  const symbol = symbolMatch ? symbolMatch[1] as keyof typeof MOCK_NEWS_DB : null;
  let days = 7;
  if (/Tomorrow/i.test(query)) days = 1;
  else if (/3 days/i.test(query)) days = 3;
  else if (/next week/i.test(query)) days = 7;
  else if (/2 weeks/i.test(query)) days = 14;
  return { symbol, days, intent: "price_forecast" };
}

function mockTransformerPrediction(symbol: string, days: number) {
  let basePrice = 50000;
  if (symbol === "FPT") basePrice = 135000;
  else if (symbol === "VIC") basePrice = 45000;
  else if (symbol === "VCB") basePrice = 92000;
  const prices = [];
  let currentPrice = basePrice;
  for (let i = 0; i < days; i++) {
    const changePercent = Math.random() * (0.02 + 0.015) - 0.015;
    currentPrice *= 1 + changePercent;
    prices.push({
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
      price: Math.round(currentPrice / 100) * 100,
    });
  }
  const finalPrice = prices[prices.length - 1].price;
  let trend = "Go sideways";
  if (finalPrice > basePrice * 1.03) trend = "Strong increase";
  else if (finalPrice > basePrice) trend = "Slight increase";
  else if (finalPrice < basePrice * 0.97) trend = "Sharp decrease";
  else if (finalPrice < basePrice) trend = "Mitigate";
  return { currentPrice: basePrice, predictedPrices: prices, trend };
}

function mockQualitativeAnalysis(symbol: string) {
  const newsItems = MOCK_NEWS_DB[symbol as keyof typeof MOCK_NEWS_DB] || [];
  if (!newsItems.length) return { sentiment: "Neutral", keyHeadlines: [] };
  const headlines = [];
  let positiveCount = 0;
  for (let i = 0; i < Math.min(newsItems.length, 2); i++) {
    const item = newsItems[i];
    headlines.push({
      title: item.title,
      source: ["CafeF", "Vietstock", "VnExpress"][Math.floor(Math.random() * 3)],
      url: `https://mock-news.com/${symbol.toLowerCase()}/article-${i}`,
      publishedDate: new Date(Date.now() - Math.floor(Math.random() * 10 + 1) * 86400000).toISOString().slice(0, 10),
    });
    if (item.sentiment === "positive") positiveCount++;
  }
  const sentiment = positiveCount >= headlines.length / 2 ? "Positive" : "Neutral";
  return { sentiment, keyHeadlines: headlines };
}

function mockReasoningModule(
  forecast: { trend: string; predictedPrices: Array<{ price: number }>; },
  analysis: { sentiment: string },
  symbol: string
) {
  const trendText = forecast.trend.toLowerCase();
  const sentimentText = analysis.sentiment.toLowerCase();
  let text = `For code stock ${symbol}, `;
  let confidence = "Medium";
  if (trendText.includes("increase") && sentimentText === "positive") {
    text += `The ${trendText} trend is reinforced by fundamental information ${sentimentText} from the market. Our model predicts that the price may move towards the ${forecast.predictedPrices[forecast.predictedPrices.length-1].price.toLocaleString()} zone. This is a noteworthy signal.`;
    confidence = "High";
  } else if (trendText.includes("reduce") && sentimentText === "negative") {
    text += `The stock may face correction pressure. Both technical analysis (trend ${trendText}) and market news are unfavorable. Investors should be cautious.`;
    confidence = "High";
  } else if (trendText.includes("increase") && sentimentText !== "positive") {
    text += `Technical analysis shows ${trendText} signal, however fundamentals do not really support this bullish momentum. Need to observe more trading sessions to confirm the trend.`;
    confidence = "Medium";
  } else {
    text += `The forecasting model shows the trend ${trendText}. There is not much sudden news affecting the stock price at the moment. Price may fluctuate around the current price range.`;
    confidence = "Short";
  }
  return { title: `Summary for ${symbol}`, text, confidence };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { queryText } = body;
  const entities = parseQuery(queryText);
  const symbol = entities.symbol;
  const days = entities.days;
  if (!symbol || !SUPPORTED_SYMBOLS.includes(symbol)) {
    return new Response(JSON.stringify({
      detail: `The stock code in question was not found or does not support it. Supported codes: ${SUPPORTED_SYMBOLS.join(", ")}`
    }), { status: 400 });
  }
  const forecastData = mockTransformerPrediction(symbol, days);
  const qualitativeData = mockQualitativeAnalysis(symbol);
  const summaryData = mockReasoningModule(forecastData, qualitativeData, symbol);
  const response = {
    responseId: `resp-${Math.floor(Math.random() * 9000 + 1000)}`,
    request: { stock_symbol: symbol, days_to_predict: days },
    forecastData,
    qualitativeAnalysis: qualitativeData,
    summary: summaryData,
    suggestedQuestions: [
      `Compare ${symbol} with another code?`,
      `Financial Summary of ${symbol}`,
      `Technical analysis for ${symbol}`,
    ],
  };
  return new Response(JSON.stringify(response), { status: 200 });
}
