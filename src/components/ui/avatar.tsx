import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-300",
  {
    variants: {
      size: {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-14 text-lg",
        xl: "size-20 text-2xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarVariants> {
  src?: string | null;
  name?: string | null;
}

export function Avatar({ className, size, src, name, ...props }: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size, className }))} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs arbitrárias enviadas pelos usuários
        <img src={src} alt={name ?? "Jogador"} className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}
