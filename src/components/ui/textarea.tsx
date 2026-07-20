import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          className={cn(
            "focus:border-brand-500 focus:ring-brand-500/15 w-full resize-none rounded-xl border border-zinc-300 bg-white px-3.5 py-3 text-base text-zinc-950 transition-colors placeholder:text-zinc-400 focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/15",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        ) : hint ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
