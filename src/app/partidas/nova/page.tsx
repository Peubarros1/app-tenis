import { MatchVisibility, SkillLevel } from "@/generated/prisma/client";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { MATCH_VISIBILITY_LABELS } from "@/lib/constants/match-labels";
import { SKILL_LEVEL_LABELS } from "@/lib/constants/skill-level-labels";
import { createMatchAction } from "./actions";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass = "flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default async function NovaPartidaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const courts = await new PrismaCourtRepository().search({});

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Organizar partida
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Marque uma pelada e convide outros jogadores.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={createMatchAction} className="mt-6 flex flex-col gap-4">
        <label className={labelClass}>
          Título
          <input
            type="text"
            name="title"
            placeholder="Ex.: Pelada de sábado"
            required
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Descrição
          <textarea
            name="description"
            rows={3}
            maxLength={1000}
            className={`resize-none ${inputClass}`}
          />
        </label>

        <label className={labelClass}>
          Quadra (opcional)
          <select name="courtId" defaultValue="" className={inputClass}>
            <option value="">A combinar</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name} — {court.neighborhood}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-4">
          <label className={labelClass}>
            Data
            <input type="date" name="date" required className={inputClass} />
          </label>
          <label className={labelClass}>
            Horário
            <input
              type="time"
              name="startTime"
              defaultValue="08:00"
              required
              className={inputClass}
            />
          </label>
        </div>

        <label className={labelClass}>
          Duração
          <select name="durationMinutes" defaultValue="90" className={inputClass}>
            <option value="60">1 hora</option>
            <option value="90">1h30</option>
            <option value="120">2 horas</option>
            <option value="180">3 horas</option>
          </select>
        </label>

        <div className="flex gap-4">
          <label className={labelClass}>
            Nível mínimo (opcional)
            <select name="minSkillLevel" defaultValue="" className={inputClass}>
              <option value="">Qualquer</option>
              {Object.values(SkillLevel).map((level) => (
                <option key={level} value={level}>
                  {SKILL_LEVEL_LABELS[level]}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Nível máximo (opcional)
            <select name="maxSkillLevel" defaultValue="" className={inputClass}>
              <option value="">Qualquer</option>
              {Object.values(SkillLevel).map((level) => (
                <option key={level} value={level}>
                  {SKILL_LEVEL_LABELS[level]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={labelClass}>
          Número máximo de jogadores
          <input
            type="number"
            name="maxPlayers"
            min={2}
            max={40}
            defaultValue={4}
            required
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Visibilidade
          <select name="visibility" defaultValue={MatchVisibility.PUBLIC} className={inputClass}>
            {Object.values(MatchVisibility).map((visibility) => (
              <option key={visibility} value={visibility}>
                {MATCH_VISIBILITY_LABELS[visibility]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="mt-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Criar partida
        </button>
      </form>
    </div>
  );
}
