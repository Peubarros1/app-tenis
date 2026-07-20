"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={description ? undefined : ""}>
              <motion.div
                className={cn(
                  "shadow-strong fixed inset-x-0 bottom-0 z-[1000] mx-auto flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
                  className,
                )}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120) onOpenChange(false);
                }}
              >
                <div className="flex shrink-0 items-center justify-center pt-3">
                  <div className="h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <div className="flex shrink-0 items-center justify-between px-5 pt-2 pb-1">
                  <Dialog.Title className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close className="ml-auto flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                    <X className="size-4" />
                    <span className="sr-only">Fechar</span>
                  </Dialog.Close>
                </div>
                {description && (
                  <Dialog.Description className="sr-only">{description}</Dialog.Description>
                )}
                <div className="overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
