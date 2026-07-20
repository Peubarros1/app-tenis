import { ChevronRight, Clock, Home, Lightbulb, Phone, Ruler, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourtMap } from "@/components/court-map-loader";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoRow } from "@/components/ui/info-row";
import { Input } from "@/components/ui/input";
import { RatingStars } from "@/components/ui/rating-stars";
import { Select } from "@/components/ui/select";
import { BookingMode, CourtType } from "@/generated/prisma/enums";
import { PrismaBookingRepository } from "@/infrastructure/persistence/prisma/booking-repository";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import {
  BOOKING_MODE_LABELS,
  SURFACE_TYPE_LABELS,
  WEEKDAY_LABELS,
} from "@/lib/constants/court-labels";
import { formatRecifeDateTime, formatRelativeDate, nowAsRecifeWallClock } from "@/lib/datetime";
import { toggleFavoriteCourtAction } from "../actions";
import { addCourtReviewAction, createBookingAction } from "./actions";
import { CourtActions } from "./_components/court-actions";
import { CourtDistance } from "./_components/court-distance";
import { PhotoGallery } from "./_components/photo-gallery";
import { ReviewForm } from "./_components/review-form";

function formatPrice(cents: number | null, currency: string) {
  if (cents === null) return "A combinar";
  if (cents === 0) return "Gratuito";
  return `${(cents / 100).toLocaleString("pt-BR", { style: "currency", currency })}/h`;
}

export default async function QuadraDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; bookingError?: string; bookingSuccess?: string }>;
}) {
  const { id } = await params;
  const { error, bookingError, bookingSuccess } = await searchParams;
  const session = await auth();

  const courtRepository = new PrismaCourtRepository();
  const court = await courtRepository.findById(id, session?.user?.id);

  if (!court) {
    notFound();
  }

  const upcomingBookings =
    court.bookingMode === BookingMode.INTERNAL
      ? await new PrismaBookingRepository().listUpcomingForCourt(court.id)
      : [];

  const today = nowAsRecifeWallClock().getUTCDay();
  const hasInPageBooking =
    court.bookingMode === BookingMode.INTERNAL ||
    (court.bookingMode === BookingMode.OFFICIAL_INTEGRATION && Boolean(court.officialBookingUrl));

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <nav className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/quadras" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Quadras
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="truncate text-zinc-700 dark:text-zinc-300">{court.name}</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {court.name}
              </h1>
              <Badge variant={court.courtType === CourtType.PRIVATE ? "accent" : "brand"}>
                {court.courtType === CourtType.PRIVATE ? "Privada" : "Pública"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {court.address} — {court.neighborhood}, {court.city}/{court.state}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {court.averageRating !== null ? (
                <>
                  <RatingStars value={court.averageRating} size="sm" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {court.averageRating.toFixed(1)} ({court.reviewCount})
                  </span>
                </>
              ) : (
                <span className="text-sm text-zinc-400 dark:text-zinc-600">Sem avaliações</span>
              )}
            </div>
          </div>

          {session?.user && (
            <form action={toggleFavoriteCourtAction} className="shrink-0">
              <input type="hidden" name="courtId" value={court.id} />
              <input type="hidden" name="redirectTo" value={`/quadras/${court.id}`} />
              <Button type="submit" variant="outline" size="icon" aria-label="Favoritar">
                {court.isFavorited ? "★" : "☆"}
              </Button>
            </form>
          )}
        </div>

        <PhotoGallery photos={court.photos} alt={court.name} />

        {court.description && (
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {court.description}
          </p>
        )}

        <Card variant="flat" padding="sm">
          <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">
            <InfoRow icon={Ruler} label="Piso" value={SURFACE_TYPE_LABELS[court.surfaceType]} />
            <InfoRow icon={Lightbulb} label="Iluminação" value={court.isLighted ? "Sim" : "Não"} />
            <InfoRow icon={Home} label="Coberta" value={court.isIndoor ? "Sim" : "Não"} />
            <InfoRow
              icon={Wallet}
              label="Preço"
              value={formatPrice(court.hourlyPriceCents, court.currency)}
            />
            {court.phone && <InfoRow icon={Phone} label="Telefone" value={court.phone} />}
          </div>
        </Card>

        <Card id="reservar" variant="elevated" padding="lg" className="scroll-mt-20">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Reservar</h2>
            <Badge variant="neutral">{BOOKING_MODE_LABELS[court.bookingMode]}</Badge>
          </div>

          {court.bookingMode === BookingMode.OFFICIAL_INTEGRATION && court.officialBookingUrl && (
            <Button asChild className="mt-4 w-full sm:w-auto">
              <a href={court.officialBookingUrl} target="_blank" rel="noopener noreferrer">
                Reservar no site oficial
              </a>
            </Button>
          )}

          {court.bookingMode === BookingMode.INFORMATIONAL && court.bookingInstructions && (
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              {court.bookingInstructions}
            </p>
          )}

          {court.bookingMode === BookingMode.INTERNAL && (
            <div className="mt-4 flex flex-col gap-4">
              {bookingError && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {bookingError}
                </p>
              )}
              {bookingSuccess && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Reserva confirmada! Veja em{" "}
                  <Link href="/reservas" className="underline underline-offset-2">
                    Minhas reservas
                  </Link>
                  .
                </p>
              )}

              {upcomingBookings.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    Próximos horários já reservados
                  </h3>
                  <ul className="mt-1.5 flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {upcomingBookings.map((slot) => (
                      <li key={slot.startTime.toISOString()}>
                        {formatRecifeDateTime(slot.startTime)} –{" "}
                        {formatRecifeDateTime(slot.endTime)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {session?.user ? (
                <form action={createBookingAction} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="courtId" value={court.id} />
                  <Input label="Data" type="date" name="date" required className="w-40" />
                  <Input
                    label="Início"
                    type="time"
                    name="startTime"
                    defaultValue="08:00"
                    required
                    className="w-32"
                  />
                  <Select label="Duração" name="durationMinutes" defaultValue="60" className="w-32">
                    <option value="60">1 hora</option>
                    <option value="90">1h30</option>
                    <option value="120">2 horas</option>
                  </Select>
                  <Button type="submit">Reservar</Button>
                </form>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  <Link href="/login" className="underline underline-offset-2">
                    Entre na sua conta
                  </Link>{" "}
                  para reservar esta quadra.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card variant="flat" padding="lg" className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Localização</h2>
          <div className="h-48 w-full overflow-hidden rounded-xl">
            <CourtMap courts={[court]} selectedCourtId={court.id} />
          </div>
          <CourtDistance latitude={court.latitude} longitude={court.longitude} />
          <CourtActions
            name={court.name}
            address={court.address}
            latitude={court.latitude}
            longitude={court.longitude}
          />
        </Card>

        {court.openingHours.length > 0 && (
          <Card variant="flat" padding="lg">
            <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-zinc-950 dark:text-zinc-50">
              <Clock className="size-4" aria-hidden />
              Horário de funcionamento
            </h2>
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {court.openingHours.map((hour) => (
                <li
                  key={hour.dayOfWeek}
                  className={cn(
                    "flex justify-between py-1.5 text-sm",
                    hour.dayOfWeek === today && "text-brand-700 dark:text-brand-400 font-semibold",
                  )}
                >
                  <span
                    className={hour.dayOfWeek === today ? "" : "text-zinc-600 dark:text-zinc-400"}
                  >
                    {WEEKDAY_LABELS[hour.dayOfWeek]}
                  </span>
                  <span
                    className={
                      hour.dayOfWeek === today ? "" : "font-medium text-zinc-950 dark:text-zinc-50"
                    }
                  >
                    {hour.opensAt} – {hour.closesAt}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Avaliações
          </h2>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          {session?.user ? (
            <div className="mt-4">
              <ReviewForm courtId={court.id} action={addCourtReviewAction} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/login" className="underline underline-offset-2">
                Entre na sua conta
              </Link>{" "}
              para avaliar esta quadra.
            </p>
          )}

          {court.reviews.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={Clock}
                title="Ainda não há avaliações"
                description="Seja o primeiro a avaliar esta quadra depois de jogar aqui."
              />
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-5">
              {court.reviews.map((review) => (
                <li
                  key={review.id}
                  className="flex gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800"
                >
                  <Avatar name={review.userName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <span className="font-medium text-zinc-950 dark:text-zinc-50">
                        {review.userName ?? "Jogador"}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-600">
                        {formatRelativeDate(review.createdAt)}
                      </span>
                    </div>
                    <RatingStars value={review.rating} size="sm" className="mt-0.5" />
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {hasInPageBooking && (
        <div className="shadow-strong fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
          <Button asChild className="w-full">
            <a href="#reservar">{formatPrice(court.hourlyPriceCents, court.currency)} · Reservar</a>
          </Button>
        </div>
      )}
    </div>
  );
}
