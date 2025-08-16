import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdBoxProps } from "@/types/adbox";

export function AdBox({
  title,
  imageUrl,
  description,
  className,
  symbol,
}: AdBoxProps) {
  return (
    <div
      className={cn(
        "w-full bg-card border border-border rounded-lg shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="relative w-full h-32 rounded-md overflow-hidden">
        <Image
          src={imageUrl || '/money.jpg'}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 300px) 100vw, 300px"
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2">
          {title}
        </h3>
        <p className="text-xs font-mono text-primary">{symbol}</p>
        <p className="text-xs text-muted-foreground line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
}
