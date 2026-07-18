import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchChat } from "@/components/match-chat";
import { ParticipantStatus } from "@/generated/prisma/client";
import { PrismaMatchRepository } from "@/infrastructure/persistence/prisma/match-repository";
import { PrismaPlayerRatingRepository } from "@/infrastructure/persistence/prisma/player-rating-repository";
import {
  MATCH_STATUS_LABELS,
  MATCH_VISIBILITY_LABELS,
  PARTICIPANT_STATUS_LABELS,
} from "@/lib/constants/match-labels";
import { SKILL_LEVEL_LABELS } from "@/lib/constants/skill-level-labels";
import { auth } from "@/lib/auth";
import { formatRecifeDateTime, nowAsRecifeWallClock } from "@/lib/datetime";
import {
  cancelMatchAction,
  inviteToMatchAction,
  joinMatchAction,
  leaveMatchAction,
  respondToMatchInviteAction,
} from "../actions";
import { ratePlayerAction } from "./rating-actions";

export default async function PartidaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    invited?: string;
    ratingError?: string;
    ratingSuccess?: string;
  }>;
}) {
  const { id } = await params;
  const { error, invited, ratingError, ratingSuccess } = await searchParams;
  const session = await auth();

  const match = await new PrismaMatchRepository().findById(id, session?.user?.id);
  if (!match) {
    notFound();
  }

  const isOrganizer = session?.user?.id === match.organizerId;
  const viewerStatus = match.viewerParticipantStatus;
  const matchIsActive = match.status === "OPEN" || match.status === "FULL";

  const matchEndsAt = new Date(match.scheduledAt.getTime() + match.durationMinutes * 60_000);
  const matchHasEnded = match.status !== "CANCELLED" && matchEndsAt < nowAsRecifeWallClock();
  const canRate =
    Boolean(session?.user) && matchHasEnded && viewerStatus === ParticipantStatus.CONFIRMED;
  const rateableParticipants =
    canRate && session?.user
      ? await new PrismaPlayerRatingRepository().listRateableParticipants(match.id, session.user.id)
      : [];

  const confirmed = match.participants.filter((p) => p.status === ParticipantStatus.CONFIRMED);
  const waitlisted = match.participants.filter((p) => p.status === ParticipantStatus.WAITLIST);
  const invitedParticipants = match.participants.filter(
    (p) => p.status === ParticipantStatus.INVITED,
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {match.title}
          </h1>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {MATCH_STATUS_LABELS[match.status]}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {formatRecifeDateTime(match.scheduledAt)} · {match.durationMinutes} min
        </p>
        {match.courtName && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href={`/quadras/${match.courtId}`} className="underline underline-offset-2">
              {match.courtName}
            </Link>{" "}
            — {match.courtNeighborhood}
          </p>
        )}
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Organizada por {match.organizerName ?? "Jogador"} ·{" "}
          {MATCH_VISIBILITY_LABELS[match.visibility]}
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {invited && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Convite enviado.
        </p>
      )}

      {match.description && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{match.description}</p>
      )}

      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Jogadores</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {match.confirmedCount}/{match.maxPlayers} confirmados
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Nível recomendado</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {match.minSkillLevel || match.maxSkillLevel
              ? `${match.minSkillLevel ? SKILL_LEVEL_LABELS[match.minSkillLevel] : "?"} – ${match.maxSkillLevel ? SKILL_LEVEL_LABELS[match.maxSkillLevel] : "?"}`
              : "Qualquer nível"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        {!session?.user && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/login" className="underline underline-offset-2">
              Entre na sua conta
            </Link>{" "}
            para participar desta partida.
          </p>
        )}

        {session?.user && isOrganizer && matchIsActive && (
          <form action={cancelMatchAction}>
            <input type="hidden" name="matchId" value={match.id} />
            <button
              type="submit"
              className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Cancelar partida
            </button>
          </form>
        )}

        {session?.user && !isOrganizer && viewerStatus === ParticipantStatus.INVITED && (
          <>
            <form action={respondToMatchInviteAction}>
              <input type="hidden" name="matchId" value={match.id} />
              <input type="hidden" name="accept" value="1" />
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Aceitar convite
              </button>
            </form>
            <form action={respondToMatchInviteAction}>
              <input type="hidden" name="matchId" value={match.id} />
              <input type="hidden" name="accept" value="0" />
              <button
                type="submit"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              >
                Recusar
              </button>
            </form>
          </>
        )}

        {session?.user &&
          !isOrganizer &&
          (viewerStatus === ParticipantStatus.CONFIRMED ||
            viewerStatus === ParticipantStatus.WAITLIST) && (
            <form action={leaveMatchAction}>
              <input type="hidden" name="matchId" value={match.id} />
              <button
                type="submit"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Sair da partida
              </button>
            </form>
          )}

        {session?.user &&
          !isOrganizer &&
          matchIsActive &&
          (viewerStatus === null ||
            viewerStatus === ParticipantStatus.DECLINED ||
            viewerStatus === ParticipantStatus.LEFT) && (
            <form action={joinMatchAction}>
              <input type="hidden" name="matchId" value={match.id} />
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {match.confirmedCount >= match.maxPlayers
                  ? "Entrar na fila de espera"
                  : "Entrar na partida"}
              </button>
            </form>
          )}
      </div>

      {isOrganizer && matchIsActive && (
        <form action={inviteToMatchAction} className="flex items-end gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Convidar por e-mail
            <input type="hidden" name="matchId" value={match.id} />
            <input
              type="email"
              name="email"
              placeholder="jogador@email.com"
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
          >
            Convidar
          </button>
        </form>
      )}

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Participantes
        </h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {confirmed.map((participant) => (
            <li key={participant.userId} className="flex justify-between">
              <span className="text-zinc-950 dark:text-zinc-50">
                {participant.userName ?? participant.userEmail}
                {participant.userId === match.organizerId ? " (organizador)" : ""}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {PARTICIPANT_STATUS_LABELS[participant.status]}
              </span>
            </li>
          ))}
        </ul>

        {waitlisted.length > 0 && (
          <>
            <h3 className="mt-4 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Fila de espera
            </h3>
            <ul className="mt-1 flex flex-col gap-1 text-sm">
              {waitlisted.map((participant) => (
                <li key={participant.userId} className="flex justify-between">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {participant.userName ?? participant.userEmail}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {isOrganizer && invitedParticipants.length > 0 && (
          <>
            <h3 className="mt-4 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Convites pendentes
            </h3>
            <ul className="mt-1 flex flex-col gap-1 text-sm">
              {invitedParticipants.map((participant) => (
                <li key={participant.userId} className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {participant.userName ?? participant.userEmail}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {canRate && rateableParticipants.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Avalie os jogadores
          </h2>

          {ratingError && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {ratingError}
            </p>
          )}
          {ratingSuccess && (
            <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Avaliação registrada.
            </p>
          )}

          <ul className="mt-2 flex flex-col gap-3">
            {rateableParticipants.map((player) => (
              <li
                key={player.userId}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  {player.name ?? "Jogador"}
                </p>
                {player.myRating !== null ? (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Sua avaliação: {"★".repeat(player.myRating)}
                    {"☆".repeat(5 - player.myRating)}
                    {player.myComment ? ` — "${player.myComment}"` : ""}
                  </p>
                ) : (
                  <form action={ratePlayerAction} className="mt-2 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="matchId" value={match.id} />
                    <input type="hidden" name="ratedUserId" value={player.userId} />
                    <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Nota
                      <select
                        name="rating"
                        defaultValue="5"
                        className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} ★
                          </option>
                        ))}
                      </select>
                    </label>
                    <input
                      type="text"
                      name="comment"
                      placeholder="Comentário (opcional)"
                      maxLength={500}
                      className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      Avaliar
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {session?.user && viewerStatus === ParticipantStatus.CONFIRMED && (
        <MatchChat matchId={match.id} currentUserId={session.user.id} />
      )}
    </div>
  );
}
