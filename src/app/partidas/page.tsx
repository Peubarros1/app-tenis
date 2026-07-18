import Link from "next/link";
import { PrismaMatchRepository } from "@/infrastructure/persistence/prisma/match-repository";
import { MATCH_STATUS_LABELS } from "@/lib/constants/match-labels";
import { SKILL_LEVEL_LABELS } from "@/lib/constants/skill-level-labels";
import { auth } from "@/lib/auth";
import { formatRecifeDateTime } from "@/lib/datetime";
import { respondToMatchInviteAction } from "./actions";

export default async function PartidasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();

  const matchRepository = new PrismaMatchRepository();
  const [matches, invites] = await Promise.all([
    matchRepository.search({}),
    session?.user ? matchRepository.listInvitesForUser(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Partidas em Recife
        </h1>
        <Link
          href="/partidas/nova"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Organizar partida
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {invites.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Seus convites pendentes
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {invites.map((match) => (
              <li
                key={match.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <div>
                  <Link
                    href={`/partidas/${match.id}`}
                    className="font-medium text-zinc-950 underline-offset-2 hover:underline dark:text-zinc-50"
                  >
                    {match.title}
                  </Link>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {formatRecifeDateTime(match.scheduledAt)}
                    {match.courtName ? ` · ${match.courtName}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={respondToMatchInviteAction}>
                    <input type="hidden" name="matchId" value={match.id} />
                    <input type="hidden" name="accept" value="1" />
                    <button
                      type="submit"
                      className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      Aceitar
                    </button>
                  </form>
                  <form action={respondToMatchInviteAction}>
                    <input type="hidden" name="matchId" value={match.id} />
                    <input type="hidden" name="accept" value="0" />
                    <button
                      type="submit"
                      className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
                    >
                      Recusar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        {matches.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma partida pública marcada ainda. Que tal organizar a primeira?
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {matches.map((match) => (
              <li key={match.id}>
                <Link
                  href={`/partidas/${match.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {match.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {MATCH_STATUS_LABELS[match.status]}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatRecifeDateTime(match.scheduledAt)}
                  </span>
                  {match.courtName && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {match.courtName} · {match.courtNeighborhood}
                    </span>
                  )}
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {match.confirmedCount}/{match.maxPlayers} jogadores
                    {match.minSkillLevel || match.maxSkillLevel
                      ? ` · Nível ${match.minSkillLevel ? SKILL_LEVEL_LABELS[match.minSkillLevel] : "?"}–${match.maxSkillLevel ? SKILL_LEVEL_LABELS[match.maxSkillLevel] : "?"}`
                      : ""}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Organizada por {match.organizerName ?? "Jogador"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
