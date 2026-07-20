"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourtSummary } from "@/domain/repositories/court-repository";
import { toast } from "@/lib/toast";
import { toggleFavoriteCourtRpcAction } from "../actions";

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courtId: string) => toggleFavoriteCourtRpcAction(courtId),
    onMutate: async (courtId: string) => {
      await queryClient.cancelQueries({ queryKey: ["courts"] });
      const previous = queryClient.getQueriesData<CourtSummary[]>({ queryKey: ["courts"] });

      queryClient.setQueriesData<CourtSummary[]>({ queryKey: ["courts"] }, (courts) =>
        courts?.map((court) =>
          court.id === courtId ? { ...court, isFavorited: !court.isFavorited } : court,
        ),
      );

      return { previous };
    },
    onError: (error, _courtId, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast(
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "Entre na sua conta para favoritar."
          : "Não foi possível favoritar agora.",
      );
    },
  });
}
