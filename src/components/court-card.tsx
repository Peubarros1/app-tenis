"use client";

import { Heart, Lightbulb, MapPin } from "lucide-react";
import Link from "next/link";
import type { CourtSummary } from "@/domain/repositories/court-repository";
import { CourtType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { cn } from "@/lib/cn";
import { SURFACE_TYPE_LABELS } from "@/lib/constants/court-labels";
import { formatDistance } from "@/lib/geo";

function formatPrice(cents: number | null) {
  if (cents === null) return "Preço a combinar";
  return `${(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/h`;
}

export interface CourtCardProps {
  court: CourtSummary;
  distanceKm?: number | null;
  onToggleFavorite?: (courtId: string) => void;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CourtCard({
  court,
  distanceKm,
  onToggleFavorite,
  selected,
  onClick,
  className,
}: CourtCardProps) {
  return (
    <Link
      href={`/quadras/${court.id}`}
      onClick={onClick}
      className={cn(
        "group hover:shadow-medium flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 dark:bg-zinc-900",
        selected
          ? "border-brand-500 shadow-medium ring-brand-500/20 ring-2"
          : "shadow-soft border-zinc-200/70 dark:border-zinc-800",
        className,
      )}
    >
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {court.coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs arbitrárias enviadas pelos usuários
          <img
            src={court.coverPhotoUrl}
            alt={court.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-zinc-300 dark:text-zinc-700">
            <MapPin className="size-8" aria-hidden />
          </div>
        )}

        <Badge
          variant={court.courtType === CourtType.PRIVATE ? "accent" : "brand"}
          className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm dark:bg-zinc-900/90"
        >
          {court.courtType === CourtType.PRIVATE ? "Privada" : "Pública"}
        </Badge>

        {onToggleFavorite && (
          <button
            type="button"
            aria-label={court.isFavorited ? "Remover dos favoritos" : "Favoritar"}
            aria-pressed={court.isFavorited}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleFavorite(court.id);
            }}
            className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-white/90 text-zinc-600 backdrop-blur-sm transition-transform active:scale-90 dark:bg-zinc-900/90 dark:text-zinc-300"
          >
            <Heart
              className={cn("size-4.5", court.isFavorited && "fill-accent-500 text-accent-500")}
              aria-hidden
            />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {court.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="line-clamp-1">{court.neighborhood}</span>
          {distanceKm != null && (
            <>
              <span aria-hidden>·</span>
              <span className="shrink-0">{formatDistance(distanceKm)}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          {court.averageRating !== null ? (
            <RatingStars value={court.averageRating} size="sm" />
          ) : (
            <span className="text-xs text-zinc-400 dark:text-zinc-600">Sem avaliações</span>
          )}
          <span className="text-brand-700 dark:text-brand-400 text-sm font-semibold">
            {formatPrice(court.hourlyPriceCents)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge variant="neutral">{SURFACE_TYPE_LABELS[court.surfaceType]}</Badge>
          {court.isLighted && (
            <Badge variant="neutral" className="gap-1">
              <Lightbulb className="size-3" aria-hidden />
              Iluminada
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
