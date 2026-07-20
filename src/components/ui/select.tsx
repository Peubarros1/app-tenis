import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            className={cn(
              "focus:border-brand-500 focus:ring-brand-500/15 h-12 w-full appearance-none rounded-xl border border-zinc-300 bg-white px-3.5 pr-10 text-base text-zinc-950 transition-colors focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
              error && "border-red-400",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
        </div>
        {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
