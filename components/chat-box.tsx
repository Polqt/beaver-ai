"use client";

import { useState } from "react";
import { cn, fetchChatbotResponse, formatRecommendations, formatInvestmentSuggestions, type ApiResponse } from "@/lib/utils";
import { Button } from "./ui/button";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: Array<{ title: string; url: string }>;
    symbols?: string[];
    suggestions?: Array<{ title: string; description: string; symbol: string }>;
  };
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hello! I'm your AI investment assistant. I can help you with investment advice, portfolio analysis, and market insights. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const data: ApiResponse = await fetchChatbotResponse("demo-user", userMessage.content);

      let content = "";

      if (data.reasoning) {
        content += `💡 Analysis:\n${data.reasoning}\n\n`;
      }

      const recommendationsText = formatRecommendations(data.recommendations);
      if (recommendationsText) {
        content += `${recommendationsText}\n`;
      }

      if (data.personalized_advice && data.personalized_advice !== "Advice has been personalized based on your profile and portfolio.") {
        content += `🎯 Personalized Advice:\n${data.personalized_advice}\n\n`;
      }

      const suggestionsText = formatInvestmentSuggestions(data.investment_suggestions);
      if (suggestionsText) {
        content += `${suggestionsText}\n`;
      }

      if (data.confidence) {
        content += `📈 Confidence Level: ${Math.round(data.confidence * 100)}%\n`;
      }

      if (data.risk_assessment && data.risk_assessment !== "Mentioned in the explanation.") {
        content += `⚠️ Risk Assessment: ${data.risk_assessment}\n`;
      }

      if (!content.trim()) {
        content = "I received your question but couldn't generate a comprehensive response. Please try rephrasing your question or ask about specific investments like stocks, gold, or crypto.";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: content.trim(),
        isUser: false,
        timestamp: new Date(),
        metadata: {
          confidence: data.confidence,
          sources: data.source_links?.map(link => ({ title: link.title, url: link.url })),
          symbols: data.symbols_analyzed,
          suggestions: data.investment_suggestions?.map(s => ({ 
            title: s.title, 
            description: s.description, 
            symbol: s.symbol 
          }))
        }
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: `😔 I encountered an issue while processing your request: ${errorMessage}\n\nPlease try again or ask about investment topics like:\n• Stock analysis (e.g., "Tell me about FPT stock")\n• Gold investment advice\n• Portfolio diversification\n• Market trends`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (text: string) => {
    if (isLoading) return;
    setInputValue(text);
  };

  return (
    <div className="flex flex-col h-full w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-border p-4 md:p-6 bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl md:text-2xl text-foreground flex items-center gap-2">
              🤖 Beaver AI Assistant
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Your intelligent investment advisor for personalized financial guidance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground hidden sm:block">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto chat-scrollbar p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-background/50 to-background">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start",
              message.isUser ? "message-enter-user" : "message-enter-ai"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 text-sm md:text-base shadow-sm",
                message.isUser
                  ? "bg-primary text-primary-foreground ml-4 md:ml-8"
                  : "bg-muted text-foreground mr-4 md:mr-8 border border-border"
              )}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              
              {/* Show metadata for AI messages */}
              {!message.isUser && message.metadata && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  {message.metadata.symbols && message.metadata.symbols.length > 0 && (
                    <div className="text-xs text-muted-foreground mb-2">
                      📊 Analyzed: {message.metadata.symbols.join(", ")}
                    </div>
                  )}
                  {message.metadata.sources && message.metadata.sources.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      🔗 Sources: {message.metadata.sources.map((source, idx) => (
                        <span key={idx}>
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {source.title}
                          </a>
                          {message.metadata && idx < message.metadata.sources!.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className={cn(
                "text-xs mt-2 opacity-70",
                message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground border border-border rounded-2xl p-3 md:p-4 text-sm md:text-base mr-4 md:mr-8 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-muted-foreground text-xs">AI is analyzing your request...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 md:p-6 bg-card/50 backdrop-blur-sm">
        <div className="flex items-end space-x-3 md:space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about investments, stocks, portfolio advice... (Press Enter to send)"
              className="w-full min-h-[44px] md:min-h-[50px] max-h-[120px] md:max-h-[150px] p-3 md:p-4 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder-muted-foreground text-sm md:text-base transition-all duration-200"
              disabled={isLoading}
              rows={1}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {inputValue.length}/500
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="h-[44px] md:h-[50px] px-4 md:px-6 rounded-xl font-medium text-sm md:text-base shadow-sm hover:shadow-md transition-all duration-200"
            size="lg"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <span className="sm:hidden">→</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleQuickAction("I want to invest in Gold")}
            className="px-3 py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors duration-200 hover:scale-105"
            disabled={isLoading}
          >
            🥇 Gold Investment
          </button>
          <button
            onClick={() => handleQuickAction("What stocks should I buy?")}
            className="px-3 py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors duration-200 hover:scale-105"
            disabled={isLoading}
          >
            📈 Stock Recommendations
          </button>
          <button
            onClick={() => handleQuickAction("How should I diversify my portfolio?")}
            className="px-3 py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors duration-200 hover:scale-105"
            disabled={isLoading}
          >
            📊 Portfolio Advice
          </button>
          <button
            onClick={() => handleQuickAction("Tell me about cryptocurrency investments")}
            className="px-3 py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors duration-200 hover:scale-105"
            disabled={isLoading}
          >
            ₿ Crypto Insights
          </button>
        </div>
      </div>
    </div>
  );
}