import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const cardVariants = cva("rounded-2xl border bg-white dark:bg-zinc-900", {
  variants: {
    variant: {
      flat: "border-zinc-200 dark:border-zinc-800",
      elevated: "border-zinc-200/60 shadow-soft dark:border-zinc-800",
      interactive:
        "border-zinc-200/60 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium dark:border-zinc-800",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "flat",
    padding: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding, className }))} {...props} />
  ),
);
Card.displayName = "Card";
