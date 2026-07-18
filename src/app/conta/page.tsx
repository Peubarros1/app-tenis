import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaPlayerRepository } from "@/infrastructure/persistence/prisma/player-repository";
import { PrismaPlayerRatingRepository } from "@/infrastructure/persistence/prisma/player-rating-repository";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { MATCH_STATUS_LABELS } from "@/lib/constants/match-labels";
import { RECIFE_NEIGHBORHOODS } from "@/lib/constants/recife-neighborhoods";
import { SKILL_LEVEL_LABELS } from "@/lib/constants/skill-level-labels";
import { SkillLevel } from "@/generated/prisma/client";
import { LocationButton } from "@/components/location-button";
import { formatRecifeDateTime } from "@/lib/datetime";
import { updateProfileAction } from "./actions";

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { error, success } = await searchParams;

  const playerRepository = new PrismaPlayerRepository();
  const playerRatingRepository = new PrismaPlayerRatingRepository();
  const [profile, favoriteCourts, stats, matchHistory] = await Promise.all([
    playerRepository.findById(session.user.id),
    playerRepository.listFavoriteCourts(session.user.id),
    playerRatingRepository.getStats(session.user.id),
    playerRatingRepository.listMatchHistory(session.user.id),
  ]);

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Minha conta
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{profile.email}</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Perfil atualizado com sucesso.
        </p>
      )}

      <form id="profile-form" action={updateProfileAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="latitude" defaultValue={profile.latitude ?? ""} />
        <input type="hidden" name="longitude" defaultValue={profile.longitude ?? ""} />

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nome completo
          <input
            type="text"
            name="name"
            defaultValue={profile.name ?? ""}
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Foto de perfil (URL)
          <input
            type="url"
            name="image"
            placeholder="https://…"
            defaultValue={profile.image ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Bio
          <textarea
            name="bio"
            rows={3}
            maxLength={280}
            defaultValue={profile.bio ?? ""}
            className="resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Telefone
          <input
            type="tel"
            name="phone"
            placeholder="(81) 90000-0000"
            defaultValue={profile.phone ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nível técnico
          <select
            name="skillLevel"
            defaultValue={profile.skillLevel}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {Object.values(SkillLevel).map((level) => (
              <option key={level} value={level}>
                {SKILL_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Bairro
          <select
            name="neighborhood"
            defaultValue={profile.neighborhood ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">Selecione…</option>
            {RECIFE_NEIGHBORHOODS.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Localização
          <LocationButton initialLatitude={profile.latitude} initialLongitude={profile.longitude} />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Salvar alterações
        </button>
      </form>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Estatísticas
        </h2>
        <dl className="mt-2 grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Partidas organizadas</dt>
            <dd className="font-medium text-zinc-950 dark:text-zinc-50">
              {stats.matchesOrganized}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Partidas disputadas</dt>
            <dd className="font-medium text-zinc-950 dark:text-zinc-50">{stats.matchesPlayed}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Avaliação recebida</dt>
            <dd className="font-medium text-zinc-950 dark:text-zinc-50">
              {stats.averageRatingReceived !== null
                ? `${stats.averageRatingReceived.toFixed(1)} ★ (${stats.ratingsReceivedCount})`
                : "Sem avaliações ainda"}
            </dd>
          </div>
        </dl>
      </section>

      {matchHistory.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Histórico de partidas
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {matchHistory.map((match) => (
              <li key={match.matchId}>
                <Link
                  href={`/partidas/${match.matchId}`}
                  className="flex flex-col rounded-md border border-zinc-200 px-3 py-2 text-sm transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-zinc-950 dark:text-zinc-50">
                      {match.title}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {MATCH_STATUS_LABELS[match.status]}
                    </span>
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {formatRecifeDateTime(match.scheduledAt)}
                    {match.courtName ? ` · ${match.courtName}` : ""}
                    {match.isOrganizer ? " · Organizador" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Quadras favoritas
        </h2>
        {favoriteCourts.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Você ainda não favoritou nenhuma quadra.{" "}
            <Link href="/quadras" className="underline underline-offset-2">
              Buscar quadras
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {favoriteCourts.map((court) => (
              <li key={court.id}>
                <Link
                  href={`/quadras/${court.id}`}
                  className="flex justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">{court.name}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{court.neighborhood}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={signOutAction} className="mt-10">
        <button
          type="submit"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
