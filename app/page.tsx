'use client';

import { AdBox } from "@/components/ad-box";
import { ChatBox } from "@/components/chat-box";
import { fetchChatbotResponse, type ApiResponse } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const [ads, setAds] = useState<ApiResponse["investment_suggestions"]>([]);

  useEffect(() => {
    async function loadData() {
      const data: ApiResponse = await fetchChatbotResponse("demo-user", "show recommendations");
      setAds(data.investment_suggestions || []);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      <main className="h-screen flex pb-16 lg:pb-0">
        <aside className="hidden lg:block w-80 bg-card border-r border-border overflow-hidden">
          <div className="p-6 h-full flex flex-col justify-start space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recommendation
            </h2>
            {ads.map((rec, idx) => (
              <AdBox
                key={rec.symbol || idx} 
                imageUrl={rec.imageUrl}
                title={`${rec.symbol} - ${rec.title}`} 
                description={rec.description}
                symbol={rec.symbol}
              />
            ))}
          </div>
        </aside>

        <section className="flex-1 flex bg-background">
          <ChatBox />
        </section>

        <aside className="hidden lg:block w-80 bg-card border-l border-border overflow-hidden">
          <div className="p-6 h-full flex flex-col justify-start space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Trending
            </h2>
            {ads.map((rec, idx) => (
              <AdBox
                key={rec.symbol || idx} 
                imageUrl={rec.imageUrl}
                title={`${rec.symbol} - ${rec.title}`} 
                description={rec.description}
                symbol={rec.symbol}
              />
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
