import { ChatBox } from "@/components/ui/chat-box";
import { AdBox } from "@/components/ui/ad-box";

export default function Home() {
  return (
    <div className="min-h-screen bg-background dark">
      <main className="h-screen flex pb-16 lg:pb-0">
        <aside className="hidden lg:block w-80 bg-card border-r border-border overflow-hidden">
          <div className="p-6 h-full flex flex-col justify-start space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recommendations
            </h2>
            <AdBox
              title="Smart Home Devices"
              imageUrl="/ad-banner-1.svg"
              description="Discover the latest smart home technology tailored to your lifestyle. Transform your living space with AI-powered devices."
              ctaText="Shop Now"
              ctaUrl="#"
            />
            <AdBox
              title="Fitness & Wellness"
              imageUrl="/ad-banner-2.svg"
              description="Personalized fitness equipment and wellness products based on your health goals and preferences."
              ctaText="Explore"
              ctaUrl="#"
            />
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
            <AdBox
              title="Learning & Development"
              imageUrl="/ad-banner-3.svg"
              description="Online courses and educational resources curated based on your interests and career goals."
              ctaText="Learn More"
              ctaUrl="#"
            />
            <AdBox
              title="Travel Experiences"
              imageUrl="/ad-banner-4.svg"
              description="Discover amazing travel destinations and experiences recommended just for you."
              ctaText="Book Now"
              ctaUrl="#"
            />
          </div>
        </aside>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2">
        <div className="flex justify-center space-x-2 overflow-x-auto">
          <button className="flex-shrink-0 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium">
            📱 Smart Devices
          </button>
          <button className="flex-shrink-0 px-3 py-2 bg-muted text-muted-foreground rounded-lg text-xs">
            💪 Fitness
          </button>
          <button className="flex-shrink-0 px-3 py-2 bg-muted text-muted-foreground rounded-lg text-xs">
            📚 Learning
          </button>
          <button className="flex-shrink-0 px-3 py-2 bg-muted text-muted-foreground rounded-lg text-xs">
            ✈️ Travel
          </button>
        </div>
      </div>
    </div>
  );
}
