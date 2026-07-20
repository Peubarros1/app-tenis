import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightSlot, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 text-zinc-400" aria-hidden>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "focus:border-brand-500 focus:ring-brand-500/15 h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-base text-zinc-950 transition-colors placeholder:text-zinc-400 focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600",
              leftIcon && "pl-11",
              rightSlot && "pr-11",
              error &&
                "border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-800",
              className,
            )}
            {...props}
          />
          {rightSlot && <span className="absolute right-3">{rightSlot}</span>}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
