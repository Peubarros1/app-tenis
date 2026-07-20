"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  active?: boolean;
}

export const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className, active, children, ...props }, ref) => (
    <div className="relative shrink-0">
      <select
        ref={ref}
        className={cn(
          "h-9 appearance-none rounded-full border bg-white pr-8 pl-3.5 text-sm font-medium transition-colors dark:bg-zinc-900",
          active
            ? "border-brand-600 text-brand-700 dark:text-brand-400"
            : "border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2",
          active ? "text-brand-600" : "text-zinc-400",
        )}
        aria-hidden
      />
    </div>
  ),
);
FilterSelect.displayName = "FilterSelect";
