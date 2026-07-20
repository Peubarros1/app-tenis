import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800", className)}
      aria-hidden
      {...props}
    />
  );
}

export function CourtCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
