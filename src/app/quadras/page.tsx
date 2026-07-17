import Link from "next/link";
import { CourtMap } from "@/components/court-map-loader";
import { StarRating } from "@/components/star-rating";
import { SurfaceType } from "@/generated/prisma/client";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { SURFACE_TYPE_LABELS } from "@/lib/constants/court-labels";
import { RECIFE_NEIGHBORHOODS } from "@/lib/constants/recife-neighborhoods";

function formatPrice(cents: number | null) {
  if (cents === null) return "Preço não informado";
  return `${(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/hora`;
}

export default async function QuadrasPage({
  searchParams,
}: {
  searchParams: Promise<{
    neighborhood?: string;
    surfaceType?: string;
    lighted?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;

  const maxPriceCents = params.maxPrice ? Math.round(Number(params.maxPrice) * 100) : undefined;
  const surfaceType =
    params.surfaceType && params.surfaceType in SurfaceType
      ? (params.surfaceType as SurfaceType)
      : undefined;

  const courtRepository = new PrismaCourtRepository();
  const courts = await courtRepository.search({
    neighborhood: params.neighborhood || undefined,
    surfaceType,
    lightedOnly: params.lighted === "1",
    maxPriceCents:
      maxPriceCents !== undefined && Number.isFinite(maxPriceCents) ? maxPriceCents : undefined,
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Quadras em Recife
        </h1>
        <Link
          href="/quadras/nova"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Cadastrar quadra
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Bairro
          <select
            name="neighborhood"
            defaultValue={params.neighborhood ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">Todos</option>
            {RECIFE_NEIGHBORHOODS.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Piso
          <select
            name="surfaceType"
            defaultValue={params.surfaceType ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">Todos</option>
            {Object.values(SurfaceType).map((type) => (
              <option key={type} value={type}>
                {SURFACE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Preço máx. (R$/h)
          <input
            type="number"
            min={0}
            step="1"
            name="maxPrice"
            defaultValue={params.maxPrice ?? ""}
            className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="lighted"
            value="1"
            defaultChecked={params.lighted === "1"}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          Com iluminação
        </label>

        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Filtrar
        </button>
      </form>

      {courts.length > 0 && (
        <CourtMap
          courts={courts.map((court) => ({
            id: court.id,
            name: court.name,
            latitude: court.latitude,
            longitude: court.longitude,
          }))}
        />
      )}

      {courts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhuma quadra encontrada com esses filtros. Que tal cadastrar a primeira?
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {courts.map((court) => (
            <li key={court.id}>
              <Link
                href={`/quadras/${court.id}`}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <span className="font-semibold text-zinc-950 dark:text-zinc-50">{court.name}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {court.neighborhood} · {SURFACE_TYPE_LABELS[court.surfaceType]}
                  {court.isLighted ? " · Iluminada" : ""}
                </span>
                <StarRating rating={court.averageRating} reviewCount={court.reviewCount} />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {formatPrice(court.hourlyPriceCents)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
