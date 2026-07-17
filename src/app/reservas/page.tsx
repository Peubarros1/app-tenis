import Link from "next/link";
import { BookingStatus } from "@/generated/prisma/client";
import { PrismaBookingRepository } from "@/infrastructure/persistence/prisma/booking-repository";
import { BOOKING_STATUS_LABELS } from "@/lib/constants/booking-labels";
import { auth } from "@/lib/auth";
import { formatRecifeDateTime, nowAsRecifeWallClock } from "@/lib/datetime";
import { cancelBookingAction } from "./actions";

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const bookings = await new PrismaBookingRepository().listForUser(session.user.id);
  const now = nowAsRecifeWallClock();
  const upcoming = bookings.filter((booking) => booking.endTime > now);
  const past = bookings.filter((booking) => booking.endTime <= now);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Minhas reservas
      </h1>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Próximas
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Você não tem reservas futuras.{" "}
            <Link href="/quadras" className="underline underline-offset-2">
              Buscar quadras
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {upcoming.map((booking) => (
              <li
                key={booking.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <div>
                  <Link
                    href={`/quadras/${booking.courtId}`}
                    className="font-medium text-zinc-950 underline-offset-2 hover:underline dark:text-zinc-50"
                  >
                    {booking.courtName}
                  </Link>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {formatRecifeDateTime(booking.startTime)} –{" "}
                    {formatRecifeDateTime(booking.endTime)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </p>
                </div>
                {booking.status !== BookingStatus.CANCELLED && (
                  <form action={cancelBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button
                      type="submit"
                      className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
                    >
                      Cancelar
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Histórico
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {past.map((booking) => (
              <li
                key={booking.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
              >
                <div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {booking.courtName}
                  </span>
                  <p>
                    {formatRecifeDateTime(booking.startTime)} –{" "}
                    {formatRecifeDateTime(booking.endTime)}
                  </p>
                </div>
                <span className="text-xs">{BOOKING_STATUS_LABELS[booking.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
