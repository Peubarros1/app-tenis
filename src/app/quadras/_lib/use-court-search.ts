"use client";

import { useQuery } from "@tanstack/react-query";
import type { CourtSummary } from "@/domain/repositories/court-repository";

export interface CourtSearchParams {
  q: string;
  neighborhood: string;
  courtType: string[];
  surfaceType: string;
  lighted: boolean;
  maxPrice: string;
}

async function fetchCourts(params: CourtSearchParams): Promise<CourtSummary[]> {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.neighborhood) searchParams.set("neighborhood", params.neighborhood);
  for (const type of params.courtType) searchParams.append("courtType", type);
  if (params.surfaceType) searchParams.set("surfaceType", params.surfaceType);
  if (params.lighted) searchParams.set("lighted", "1");
  if (params.maxPrice) searchParams.set("maxPrice", params.maxPrice);

  const response = await fetch(`/api/quadras/search?${searchParams.toString()}`);
  if (!response.ok) throw new Error("Falha ao buscar quadras.");
  const data: { courts: CourtSummary[] } = await response.json();
  return data.courts;
}

export function useCourtSearch(params: CourtSearchParams, initialData?: CourtSummary[]) {
  return useQuery({
    queryKey: ["courts", params],
    queryFn: () => fetchCourts(params),
    placeholderData: (previous) => previous,
    initialData,
  });
}
