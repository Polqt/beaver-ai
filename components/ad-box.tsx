import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdBoxProps } from "@/types/adbox";

export function AdBox({
  title,
  imageUrl,
  description,
  ctaText = "Learn More",
  ctaUrl = "#",
  className,
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
          src={imageUrl}
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
        <p className="text-xs text-muted-foreground line-clamp-3">
          {description}
        </p>
      </div>

      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center bg-primary text-primary-foreground text-xs font-medium py-2 px-3 rounded-md hover:bg-primary/90 transition-colors"
      >
        {ctaText}
      </a>
    </div>
  );
}
