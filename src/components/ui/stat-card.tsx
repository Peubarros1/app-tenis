import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800",
        className,
      )}
    >
      <div className="bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400 flex size-8 items-center justify-center rounded-full">
        <Icon className="size-4" aria-hidden />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
