import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdBoxProps } from "@/types/adbox";
import { TrendingUp, DollarSign, Zap } from "lucide-react";

export function AdBox({
  title,
  imageUrl,
  description,
  className,
  symbol,
}: AdBoxProps) {
  const getAssetIcon = () => {
    const titleLower = title.toLowerCase();
    const symbolLower = symbol.toLowerCase();
    
    if (symbolLower.includes('btc') || symbolLower.includes('eth') || titleLower.includes('crypto') || titleLower.includes('bitcoin')) {
      return <Zap className="w-4 h-4 text-orange-500" />;
    } else if (symbolLower.includes('gold') || titleLower.includes('gold')) {
      return <DollarSign className="w-4 h-4 text-yellow-500" />;
    } else {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = getPlaceholderImage(symbol);
  };

  const getPlaceholderImage = (symbol: string) => {
    const colors = {
      'GOLD': '#FFD700',
      'BTC': '#F7931A',
      'ETH': '#627EEA',
      'TECH': '#4285F4',
      'FPT': '#00A651',
    };
    
    const color = colors[symbol as keyof typeof colors] || '#6366F1';
    
    const svg = `
      <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}80;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#grad)" rx="8"/>
        <text x="100" y="60" text-anchor="middle" dominant-baseline="middle" 
              fill="white" font-family="Arial" font-size="20" font-weight="bold">
          ${symbol}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    if (url.includes('ads.beaverx.ai') || url.includes('sample_banner')) return false;
    return url.startsWith('http') && (url.includes('.jpg') || url.includes('.png') || url.includes('.webp') || url.includes('.svg'));
  };

  const imageToUse = (imageUrl && isValidImageUrl(imageUrl)) ? imageUrl : getPlaceholderImage(symbol);

  return (
    <div
      className={cn(
        "group w-full bg-gradient-to-br from-card via-card to-card/80 border border-border/50 rounded-xl shadow-sm p-4 space-y-3 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer hover:scale-[1.02] backdrop-blur-sm",
        className
      )}
    >
      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        <Image
          src={imageToUse}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 300px) 100vw, 300px"
          onError={handleImageError}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full p-1.5">
          {getAssetIcon()}
        </div>
        
        <div className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-mono font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {symbol}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          <div className="flex-shrink-0 bg-muted/50 text-primary text-xs font-mono font-medium px-2 py-1 rounded-md border border-border/50">
            {symbol}
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}