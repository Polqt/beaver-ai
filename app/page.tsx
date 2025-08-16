'use client';

import { AdBox } from "@/components/ad-box";
import { ChatBox } from "@/components/chat-box";
import { fetchChatbotResponse, type ApiResponse } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";

export default function Home() {
  const [ads, setAds] = useState<ApiResponse["investment_suggestions"]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateBanners = useCallback(async (question: string, userId: string = "demo-user") => {
    setIsLoading(true);
    try {
      const data: ApiResponse = await fetchChatbotResponse(userId, question);
      if (data.investment_suggestions && data.investment_suggestions.length > 0) {
        setAds(data.investment_suggestions);
      }
    } catch (error) {
      console.error("Failed to update banners:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    updateBanners("show general investment recommendations");
  }, [updateBanners]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark">
      <main className="h-screen flex pb-16 lg:pb-0 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"></div>
        </div>
        <aside className="hidden lg:block w-80 bg-gradient-to-b from-card/50 to-background/50 border-r border-border/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">💡</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Recommendations
                </h2>
              </div>
              {isLoading && (
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-gentle pr-2">
              {ads.length > 0 ? (
                ads.map((rec, idx) => (
                  <AdBox
                    key={`rec-${rec.symbol || idx}`} 
                    imageUrl={rec.imageUrl}
                    title={rec.title} 
                    description={rec.description}
                    symbol={rec.symbol}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground mt-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mx-auto">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">No recommendations yet</p>
                    <p className="text-xs">Ask about investments to see personalized suggestions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="flex-1 flex bg-background/50 backdrop-blur-sm relative z-10">
          <ChatBox />
        </section>

        <aside className="hidden lg:block w-80 bg-gradient-to-b from-background/50 to-card/50 border-l border-border/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <span className="text-green-500 font-semibold text-sm">🔥</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Related Investments
                </h2>
              </div>
              {isLoading && (
                <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
              )}
            </div>
          
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-gentle pr-2">
              {ads.length > 0 ? (
                ads.slice().reverse().map((rec, idx) => (
                  <AdBox
                    key={`trend-${rec.symbol || idx}`} 
                    imageUrl={rec.imageUrl}
                    title={rec.title} 
                    description={rec.description}
                    symbol={rec.symbol}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground mt-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mx-auto">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Discover related opportunities</p>
                    <p className="text-xs">Related investments will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}