"use client";

import { Star } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

const SIZES = { sm: "size-3.5", md: "size-4", lg: "size-6" } as const;

export interface RatingStarsProps {
  value: number;
  size?: keyof typeof SIZES;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function RatingStars({
  value,
  size = "md",
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const displayValue = hovered ?? value;
  const rounded = Math.round(displayValue);

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Escolha uma nota" : `Nota ${value.toFixed(1)} de 5`}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        const Comp = interactive ? "button" : "span";
        return (
          <Comp
            key={star}
            type={interactive ? "button" : undefined}
            aria-label={interactive ? `${star} estrela${star > 1 ? "s" : ""}` : undefined}
            className={interactive ? "p-0.5 active:scale-90" : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
          >
            <Star
              className={cn(
                SIZES[size],
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700",
              )}
            />
          </Comp>
        );
      })}
    </div>
  );
}
