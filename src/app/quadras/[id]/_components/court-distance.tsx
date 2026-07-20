"use client";

import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { distanceKm, estimateDriveMinutes, formatDistance } from "@/lib/geo";
import { useGeolocation } from "@/lib/use-geolocation";

export function CourtDistance({ latitude, longitude }: { latitude: number; longitude: number }) {
  const { coords, status, request } = useGeolocation();

  if (status === "granted" && coords) {
    const km = distanceKm(coords, { latitude, longitude });
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-950 dark:text-zinc-50">{formatDistance(km)}</span> de
        você · ~{estimateDriveMinutes(km)} min de carro
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Não foi possível calcular a distância até você.
      </p>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3.5"
      loading={status === "loading"}
      onClick={request}
    >
      <LocateFixed className="size-3.5" aria-hidden />
      Calcular distância até você
    </Button>
  );
}
