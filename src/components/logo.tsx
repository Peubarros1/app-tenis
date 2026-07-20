import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#157f77" />
      <circle cx="20" cy="20" r="12" fill="white" />
      <path
        d="M11 12c5 4 5 12 0 16"
        stroke="#157f77"
        strokeWidth="2.25"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M29 12c-5 4-5 12 0 16"
        stroke="#157f77"
        strokeWidth="2.25"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface LogoProps {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}

export function Logo({
  className,
  iconClassName,
  wordmarkClassName,
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("size-7 shrink-0", iconClassName)} />
      {showWordmark && (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50",
            wordmarkClassName,
          )}
        >
          Saibro
        </span>
      )}
    </span>
  );
}
