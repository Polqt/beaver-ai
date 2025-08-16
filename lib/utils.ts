import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SourceLink {
  index: number;
  title: string;
  url: string;
}

interface InvestmentSuggestion {
  title: string;
  description: string;
  asset_class: string;
  symbol: string;
  imageUrl: string;
}

interface BiasAnalysis {
  status: string;
}

export interface PortfolioSummary {
  id: string;
  unit: string;
  currency: string;
  amount: number;
  medianPrice: number;
  updatedAt: number;
}

export interface Portfolio {
  transactions: unknown[];
  watchList: unknown[];
  summary: PortfolioSummary[];
}

export interface ApiRequest {
  question: string;
  user_id: string;
  context: {
    additionalProp1?: unknown;
  };
  portfolio: Portfolio;
}

export interface ApiResponse {
  question: string;
  symbols_analyzed: string[];
  recommendations: Record<string, string>;
  reasoning: string;
  personalized_advice: string;
  confidence: number;
  risk_assessment: string;
  bias_analysis: BiasAnalysis;
  data_sources: string[];
  timestamp: string;
  detected_language: string;
  source_links: SourceLink[];
  investment_suggestions: InvestmentSuggestion[];
}

const defaultPortfolio: Portfolio = {
  transactions: [],
  watchList: [],
  summary: [
    {
      id: "portfolio_summary",
      unit: "USD",
      currency: "USD",
      amount: 0,
      medianPrice: 0,
      updatedAt: Date.now()
    }
  ]
};

// Fallback data for when API fails or returns empty suggestions
const getFallbackSuggestions = (question: string): InvestmentSuggestion[] => {
  const questionLower = question.toLowerCase();
  
  // Default suggestions based on question content
  if (questionLower.includes('gold') || questionLower.includes('precious metal')) {
    return [
      {
        title: "Stabilize with Gold",
        description: "Hedge against market fluctuations with gold investments.",
        asset_class: "commodity",
        symbol: "GOLD",
        imageUrl: "https://ads.beaverx.ai/sample_banner/gold.png"
      }
    ];
  } else if (questionLower.includes('tech') || questionLower.includes('technology')) {
    return [
      {
        title: "Tech Growth Opportunity",
        description: "Invest in leading technology companies for growth potential.",
        asset_class: "stock",
        symbol: "TECH",
        imageUrl: "https://ads.beaverx.ai/sample_banner/stock.png"
      }
    ];
  } else if (questionLower.includes('crypto') || questionLower.includes('bitcoin')) {
    return [
      {
        title: "Digital Assets - Bitcoin",
        description: "Explore cryptocurrency investments with Bitcoin.",
        asset_class: "crypto",
        symbol: "BTC",
        imageUrl: "https://ads.beaverx.ai/sample_banner/crypto.png"
      }
    ];
  }
  
  // Generic fallback suggestions
  return [
    {
      title: "Diversify with Tech Growth",
      description: "Leverage market opportunities with technology investments.",
      asset_class: "stock",
      symbol: "TECH",
      imageUrl: "https://ads.beaverx.ai/sample_banner/stock.png"
    },
    {
      title: "Stabilize with Gold",
      description: "Hedge against market fluctuations with gold.",
      asset_class: "commodity",
      symbol: "GOLD",
      imageUrl: "https://ads.beaverx.ai/sample_banner/gold.png"
    },
    {
      title: "Explore Digital Assets",
      description: "Consider cryptocurrency for portfolio diversification.",
      asset_class: "crypto",
      symbol: "BTC",
      imageUrl: "https://ads.beaverx.ai/sample_banner/crypto.png"
    }
  ];
};

export async function fetchChatbotResponse(userId: string, question: string): Promise<ApiResponse> {
  const requestPayload: ApiRequest = {
    question: question,
    user_id: userId,
    context: {
      additionalProp1: {}
    },
    portfolio: defaultPortfolio
  };

  console.log("[DEBUG] API Request payload:", requestPayload);

  try {
    const response = await fetch("https://ai.beaverx.ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);

      return createFallbackResponse(question, userId);
    }

    const data: ApiResponse = await response.json();

    if (!data.investment_suggestions || data.investment_suggestions.length === 0) {
      data.investment_suggestions = getFallbackSuggestions(question);
    }
    
    return data;
  } catch (error) {
    console.error("[ERROR] API call failed:", error);

    return createFallbackResponse(question, userId);
  }
}

function createFallbackResponse(question: string, userId: string): ApiResponse {
  return {
    question,
    symbols_analyzed: [],
    recommendations: {},
    reasoning: "I'm currently having trouble accessing real-time data, but I can still provide some general investment guidance based on your question. Please try again later for more detailed analysis.",
    personalized_advice: "Advice will be more detailed once connection is restored.",
    confidence: 0.5,
    risk_assessment: "General risk assessment unavailable",
    bias_analysis: { status: "Analysis unavailable" },
    data_sources: ["Fallback Response"],
    timestamp: new Date().toISOString(),
    detected_language: "en",
    source_links: [],
    investment_suggestions: getFallbackSuggestions(question)
  };
}

export function formatRecommendations(recommendations: Record<string, unknown>): string {
  if (!recommendations || Object.keys(recommendations).length === 0) {
    return "";
  }

  let formatted = "📊 Recommendations:\n";
  for (const [symbol, rec] of Object.entries(recommendations)) {
    formatted += `- ${symbol}: ${rec}\n`;
  }
  return formatted;
}

export function formatInvestmentSuggestions(suggestions: InvestmentSuggestion[]): string {
  if (!suggestions || suggestions.length === 0) {
    return "";
  }

  let formatted = "💡 Investment Suggestions:\n";
  suggestions.forEach((suggestion, index) => {
    formatted += `${index + 1}. ${suggestion.title} (${suggestion.symbol})\n   ${suggestion.description}\n`;
  });
  return formatted;
}

export function extractSymbolsFromQuestion(question: string): string[] {
  const questionLower = question.toLowerCase();
  const symbols: string[] = [];

  const symbolMap: Record<string, string> = {
    'gold': 'GOLD',
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'tesla': 'TSLA',
    'amazon': 'AMZN',
    'google': 'GOOGL',
    'nvidia': 'NVDA',
    'meta': 'META'
  };
  
  for (const [keyword, symbol] of Object.entries(symbolMap)) {
    if (questionLower.includes(keyword)) {
      symbols.push(symbol);
    }
  }
  
  return symbols;
}