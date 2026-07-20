"use client";

import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface PhotoGalleryProps {
  photos: { id: string; url: string }[];
  alt: string;
}

export function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);

  function scrollToIndex(index: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: index * scroller.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActive(index);
  }

  if (photos.length === 0) {
    return (
      <div className="flex aspect-16/9 w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700">
        <MapPin className="size-10" aria-hidden />
      </div>
    );
  }

  return (
    <div className="group relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="scrollbar-hide flex aspect-16/9 w-full snap-x snap-mandatory overflow-x-auto rounded-2xl"
      >
        {photos.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs arbitrárias enviadas pelos usuários
          <img
            key={photo.id}
            src={photo.url}
            alt={alt}
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
            className="shadow-soft absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-900/90 dark:text-zinc-200"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => scrollToIndex(Math.min(photos.length - 1, active + 1))}
            className="shadow-soft absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-900/90 dark:text-zinc-200"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Ver foto ${index + 1}`}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === active ? "w-5 bg-white" : "w-1.5 bg-white/60",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
