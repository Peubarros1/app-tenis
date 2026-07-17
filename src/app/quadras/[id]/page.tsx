import Link from "next/link";
import { notFound } from "next/navigation";
import { StarRating } from "@/components/star-rating";
import { BookingMode } from "@/generated/prisma/client";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import {
  BOOKING_MODE_LABELS,
  COURT_TYPE_LABELS,
  SURFACE_TYPE_LABELS,
  WEEKDAY_LABELS,
} from "@/lib/constants/court-labels";
import { auth } from "@/lib/auth";
import { toggleFavoriteCourtAction } from "../actions";
import { addCourtReviewAction } from "./actions";

function formatPrice(cents: number | null, currency: string) {
  if (cents === null) return "Preço não informado";
  return `${(cents / 100).toLocaleString("pt-BR", { style: "currency", currency })}/hora`;
}

export default async function QuadraDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await auth();

  const courtRepository = new PrismaCourtRepository();
  const court = await courtRepository.findById(id, session?.user?.id);

  if (!court) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {court.name}
          </h1>
          {session?.user && (
            <form action={toggleFavoriteCourtAction}>
              <input type="hidden" name="courtId" value={court.id} />
              <input type="hidden" name="redirectTo" value={`/quadras/${court.id}`} />
              <button
                type="submit"
                className="shrink-0 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                {court.isFavorited ? "★ Favoritada" : "☆ Favoritar"}
              </button>
            </form>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {court.address} — {court.neighborhood}, {court.city}/{court.state}
        </p>
        <div className="mt-3">
          <StarRating rating={court.averageRating} reviewCount={court.reviewCount} />
        </div>
      </div>

      {court.photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {court.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs arbitrárias enviadas pelos usuários
            <img
              key={photo.id}
              src={photo.url}
              alt={court.name}
              className="h-48 w-64 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {court.description && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{court.description}</p>
      )}

      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Tipo</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {COURT_TYPE_LABELS[court.courtType]}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Piso</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {SURFACE_TYPE_LABELS[court.surfaceType]}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Iluminação</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {court.isLighted ? "Sim" : "Não"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Coberta</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {court.isIndoor ? "Sim" : "Não"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Preço</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {formatPrice(court.hourlyPriceCents, court.currency)}
          </dd>
        </div>
        {court.phone && (
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Telefone</dt>
            <dd className="font-medium text-zinc-950 dark:text-zinc-50">{court.phone}</dd>
          </div>
        )}
      </dl>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {BOOKING_MODE_LABELS[court.bookingMode]}
        </h2>
        {court.bookingMode === BookingMode.OFFICIAL_INTEGRATION && court.officialBookingUrl && (
          <a
            href={court.officialBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-50"
          >
            Reservar no site oficial →
          </a>
        )}
        {court.bookingMode === BookingMode.INFORMATIONAL && court.bookingInstructions && (
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            {court.bookingInstructions}
          </p>
        )}
        {court.bookingMode === BookingMode.INTERNAL && (
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Reservas organizadas pela plataforma chegam na Etapa 6.
          </p>
        )}
      </div>

      {court.openingHours.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Horário de funcionamento
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {court.openingHours.map((hour) => (
              <li key={hour.dayOfWeek} className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {WEEKDAY_LABELS[hour.dayOfWeek]}
                </span>
                <span className="font-medium text-zinc-950 dark:text-zinc-50">
                  {hour.opensAt} – {hour.closesAt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Avaliações
        </h2>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {session?.user ? (
          <form action={addCourtReviewAction} className="mt-4 flex flex-col gap-3">
            <input type="hidden" name="courtId" value={court.id} />
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Sua nota
              <select
                name="rating"
                defaultValue="5"
                className="w-24 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} ★
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Comentário (opcional)
              <textarea
                name="comment"
                rows={2}
                maxLength={500}
                className="resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
            <button
              type="submit"
              className="w-fit rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Enviar avaliação
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/login" className="underline underline-offset-2">
              Entre na sua conta
            </Link>{" "}
            para avaliar esta quadra.
          </p>
        )}

        {court.reviews.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            Ainda não há avaliações para esta quadra.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {court.reviews.map((review) => (
              <li key={review.id} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">
                    {review.userName ?? "Jogador"}
                  </span>
                  <span className="text-amber-500" aria-hidden>
                    {"★".repeat(review.rating)}
                    <span className="text-zinc-300 dark:text-zinc-700">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{review.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
