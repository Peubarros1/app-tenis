"use client";

import { Heart, Lightbulb, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import type { CourtSummary } from "@/domain/repositories/court-repository";
import { CourtType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { SURFACE_TYPE_LABELS } from "@/lib/constants/court-labels";
import { distanceKm, estimateDriveMinutes, formatDistance } from "@/lib/geo";

function formatPrice(cents: number | null) {
  if (cents === null) return "Preço a combinar";
  return `${(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/hora`;
}

export interface CourtPreviewSheetProps {
  court: CourtSummary | null;
  onClose: () => void;
  onToggleFavorite: (courtId: string) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function CourtPreviewSheet({
  court,
  onClose,
  onToggleFavorite,
  userLocation,
}: CourtPreviewSheetProps) {
  const km = court && userLocation ? distanceKm(userLocation, court) : null;

  return (
    <BottomSheet open={Boolean(court)} onOpenChange={(open) => !open && onClose()} title="Quadra">
      {court && (
        <div className="flex flex-col gap-4 pb-2">
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            {court.coverPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs arbitrárias enviadas pelos usuários
              <img src={court.coverPhotoUrl} alt={court.name} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-zinc-300 dark:text-zinc-700">
                <MapPin className="size-10" aria-hidden />
              </div>
            )}
            <Badge
              variant={court.courtType === CourtType.PRIVATE ? "accent" : "brand"}
              className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm dark:bg-zinc-900/90"
            >
              {court.courtType === CourtType.PRIVATE ? "Privada" : "Pública"}
            </Badge>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {court.name}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{court.neighborhood}</p>
            </div>
            <button
              type="button"
              aria-label={court.isFavorited ? "Remover dos favoritos" : "Favoritar"}
              aria-pressed={court.isFavorited}
              onClick={() => onToggleFavorite(court.id)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-transform active:scale-90 dark:border-zinc-700 dark:text-zinc-400"
            >
              <Heart
                className={court.isFavorited ? "fill-accent-500 text-accent-500 size-5" : "size-5"}
                aria-hidden
              />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {court.averageRating !== null ? (
              <RatingStars value={court.averageRating} size="sm" />
            ) : (
              <span className="text-xs text-zinc-400 dark:text-zinc-600">Sem avaliações</span>
            )}
            <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>
              ·
            </span>
            <Badge variant="neutral">{SURFACE_TYPE_LABELS[court.surfaceType]}</Badge>
            {court.isLighted && (
              <Badge variant="neutral" className="gap-1">
                <Lightbulb className="size-3" aria-hidden />
                Iluminada
              </Badge>
            )}
          </div>

          {km !== null && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Navigation className="text-brand-600 size-4" aria-hidden />
              <span>
                {formatDistance(km)} de você · ~{estimateDriveMinutes(km)} min de carro
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <span className="text-brand-700 dark:text-brand-400 text-lg font-semibold">
              {formatPrice(court.hourlyPriceCents)}
            </span>
            <Button asChild size="md">
              <Link href={`/quadras/${court.id}`}>Ver detalhes</Link>
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
