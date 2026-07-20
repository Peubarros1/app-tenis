"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl! border! border-zinc-200! bg-white! shadow-medium! dark:border-zinc-800! dark:bg-zinc-900!",
          title: "text-sm! font-medium! text-zinc-950! dark:text-zinc-50!",
          description: "text-sm! text-zinc-500! dark:text-zinc-400!",
          actionButton: "bg-brand-600! text-white!",
        },
      }}
    />
  );
}
