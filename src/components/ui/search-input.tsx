"use client";

import { Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, placeholder = "Buscar…", ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 size-4 text-zinc-400"
          aria-hidden
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "focus:border-brand-500 focus:ring-brand-500/15 h-11 w-full rounded-full border border-zinc-300 bg-white pr-9 pl-10 text-sm text-zinc-950 transition-colors placeholder:text-zinc-400 focus:ring-4 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 [&::-webkit-search-cancel-button]:hidden",
            className,
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpar busca"
            className="absolute right-3 flex size-5 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
