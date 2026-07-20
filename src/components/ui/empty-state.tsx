import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
        <Icon className="size-7" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
        {description && (
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
