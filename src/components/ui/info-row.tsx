import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InfoRow({ icon: Icon, label, value, className }: InfoRowProps) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5", className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
          {value}
        </span>
      </div>
    </div>
  );
}
