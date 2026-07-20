"use client";

import { AlertTriangle, LocateFixed, MapPin, PlusCircle, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CourtCard } from "@/components/court-card";
import { CourtMap } from "@/components/court-map-loader";
import { CourtPreviewSheet } from "@/components/court-preview-sheet";
import { Button } from "@/components/ui/button";
import { CourtCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import type { CourtSummary } from "@/domain/repositories/court-repository";
import { CourtType, SurfaceType } from "@/generated/prisma/enums";
import { SURFACE_TYPE_LABELS } from "@/lib/constants/court-labels";
import { RECIFE_NEIGHBORHOODS } from "@/lib/constants/recife-neighborhoods";
import { distanceKm } from "@/lib/geo";
import { toast } from "@/lib/toast";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useGeolocation } from "@/lib/use-geolocation";
import { FilterChip } from "@/components/ui/filter-chip";
import { FilterSelect } from "../_lib/filter-select";
import { useCourtSearch } from "../_lib/use-court-search";
import { useToggleFavorite } from "../_lib/use-toggle-favorite";

export function QuadrasExplorer({ initialCourts }: { initialCourts: CourtSummary[] }) {
  const [q, setQ] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [surfaceType, setSurfaceType] = useState("");
  const [courtTypeGroup, setCourtTypeGroup] = useState<"" | "PUBLIC" | "PRIVATE">("");
  const [lighted, setLighted] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);

  const debouncedQ = useDebouncedValue(q, 300);
  const debouncedMaxPrice = useDebouncedValue(maxPrice, 400);
  const geolocation = useGeolocation();
  const toggleFavorite = useToggleFavorite();

  const courtType = useMemo(() => {
    if (courtTypeGroup === "PUBLIC")
      return [CourtType.PUBLIC_OFFICIAL, CourtType.PUBLIC_UNOFFICIAL];
    if (courtTypeGroup === "PRIVATE") return [CourtType.PRIVATE];
    return [];
  }, [courtTypeGroup]);

  const isDefaultParams =
    !debouncedQ &&
    !neighborhood &&
    !surfaceType &&
    !courtTypeGroup &&
    !lighted &&
    !debouncedMaxPrice;

  const {
    data: courts = initialCourts,
    isFetching,
    isError,
    refetch,
  } = useCourtSearch(
    {
      q: debouncedQ,
      neighborhood,
      courtType,
      surfaceType,
      lighted,
      maxPrice: debouncedMaxPrice,
    },
    isDefaultParams ? initialCourts : undefined,
  );

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId) ?? null,
    [courts, selectedCourtId],
  );

  const coordsByCourtId = useMemo(() => {
    if (!geolocation.coords) return null;
    const map = new Map<string, number>();
    for (const court of courts) {
      map.set(court.id, distanceKm(geolocation.coords, court));
    }
    return map;
  }, [courts, geolocation.coords]);

  function handleToggleFavorite(courtId: string) {
    toggleFavorite.mutate(courtId, {
      onSuccess: ({ favorited }) => {
        toast(favorited ? "Adicionada aos favoritos." : "Removida dos favoritos.");
      },
    });
  }

  const activeFilterCount = [
    neighborhood,
    surfaceType,
    courtTypeGroup,
    lighted || null,
    maxPrice,
  ].filter(Boolean).length;

  function handleClearFilters() {
    setNeighborhood("");
    setSurfaceType("");
    setCourtTypeGroup("");
    setLighted(false);
    setMaxPrice("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* Coluna de busca + lista — abaixo do mapa no mobile, à esquerda no desktop */}
      <div className="order-2 flex min-h-0 flex-1 flex-col lg:order-1 lg:max-w-md lg:border-r lg:border-zinc-200 lg:dark:border-zinc-800">
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Quadras em Recife
            </h1>
            <Button asChild size="sm" variant="outline">
              <Link href="/quadras/nova">
                <PlusCircle className="size-4" aria-hidden />
                Cadastrar
              </Link>
            </Button>
          </div>

          <SearchInput value={q} onChange={setQ} placeholder="Buscar por nome ou bairro…" />

          <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5">
            <SlidersHorizontal className="size-4 shrink-0 text-zinc-400" aria-hidden />

            <FilterSelect
              value={neighborhood}
              active={Boolean(neighborhood)}
              onChange={(event) => setNeighborhood(event.target.value)}
            >
              <option value="">Bairro</option>
              {RECIFE_NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              value={surfaceType}
              active={Boolean(surfaceType)}
              onChange={(event) => setSurfaceType(event.target.value)}
            >
              <option value="">Piso</option>
              {Object.values(SurfaceType).map((type) => (
                <option key={type} value={type}>
                  {SURFACE_TYPE_LABELS[type]}
                </option>
              ))}
            </FilterSelect>

            <FilterChip
              selected={courtTypeGroup === "PUBLIC"}
              onClick={() => setCourtTypeGroup((current) => (current === "PUBLIC" ? "" : "PUBLIC"))}
            >
              Pública
            </FilterChip>
            <FilterChip
              selected={courtTypeGroup === "PRIVATE"}
              onClick={() =>
                setCourtTypeGroup((current) => (current === "PRIVATE" ? "" : "PRIVATE"))
              }
            >
              Privada
            </FilterChip>
            <FilterChip selected={lighted} onClick={() => setLighted((current) => !current)}>
              Iluminada
            </FilterChip>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex h-9 shrink-0 items-center gap-1 rounded-full px-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <X className="size-3.5" aria-hidden />
                Limpar
              </button>
            )}

            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Preço máx."
              className="focus:border-brand-500 focus:ring-brand-500/15 h-9 w-28 shrink-0 rounded-full border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:ring-4 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            />

            <button
              type="button"
              onClick={geolocation.request}
              className="ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
            >
              <LocateFixed
                className={
                  geolocation.status === "loading"
                    ? "text-brand-600 size-3.5 animate-pulse"
                    : "size-3.5"
                }
                aria-hidden
              />
              Perto de mim
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {isFetching
              ? "Atualizando…"
              : `${courts.length} quadra${courts.length === 1 ? "" : "s"} encontrada${courts.length === 1 ? "" : "s"}`}
            {activeFilterCount > 0 && !isFetching ? ` · ${activeFilterCount} filtro(s)` : ""}
          </p>
        </div>

        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto p-4 pt-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {isError && (
            <div className="col-span-full">
              <EmptyState
                icon={AlertTriangle}
                title="Não foi possível carregar as quadras"
                description="Verifique sua conexão e tente novamente."
                action={
                  <Button size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                }
              />
            </div>
          )}

          {!isError && isFetching && courts.length === 0
            ? Array.from({ length: 6 }).map((_, index) => <CourtCardSkeleton key={index} />)
            : null}

          {!isError && !isFetching && courts.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={MapPin}
                title="Nenhuma quadra encontrada"
                description="Tente ajustar os filtros ou seja o primeiro a cadastrar uma quadra nessa região."
                action={
                  <Button asChild size="sm">
                    <Link href="/quadras/nova">Cadastrar quadra</Link>
                  </Button>
                }
              />
            </div>
          )}

          {!isError &&
            courts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                distanceKm={coordsByCourtId?.get(court.id) ?? null}
                selected={court.id === selectedCourtId}
                onToggleFavorite={handleToggleFavorite}
                onClick={() => setSelectedCourtId(court.id)}
              />
            ))}
        </div>
      </div>

      {/* Mapa */}
      {/* Mapa — em cima no mobile, à direita no desktop */}
      <div className="relative order-1 h-[45vh] w-full shrink-0 lg:order-2 lg:h-auto lg:flex-1">
        <CourtMap
          courts={courts}
          selectedCourtId={selectedCourtId}
          onSelectCourt={setSelectedCourtId}
          userLocation={geolocation.coords}
        />
      </div>

      <CourtPreviewSheet
        court={selectedCourt}
        onClose={() => setSelectedCourtId(null)}
        onToggleFavorite={handleToggleFavorite}
        userLocation={geolocation.coords}
      />
    </div>
  );
}
