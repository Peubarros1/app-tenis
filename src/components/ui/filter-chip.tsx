"use client";

import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: React.ReactNode;
}

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, selected, icon, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 active:scale-[0.97]",
        selected
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600",
        className,
      )}
      {...props}
    >
      {selected ? <Check className="size-3.5" aria-hidden /> : icon}
      {children}
    </button>
  ),
);
FilterChip.displayName = "FilterChip";
