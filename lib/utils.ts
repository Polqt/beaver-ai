import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SourceLink {
  index: number;
  title: string;
  url: string;
}

export interface InvestmentSuggestion {
  title: string;
  description: string;
  asset_class: string;
  symbol: string;
}

export interface BiasAnalysis {
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
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data: ApiResponse = await response.json();
    console.log("[DEBUG] API Response:", data);
    
    return data;
  } catch (error) {
    console.error("[ERROR] API call failed:", error);
    throw error;
  }
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