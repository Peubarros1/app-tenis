import { LocationButton } from "@/components/location-button";
import { BookingMode, CourtType, SurfaceType } from "@/generated/prisma/client";
import {
  BOOKING_MODE_LABELS,
  COURT_TYPE_LABELS,
  SURFACE_TYPE_LABELS,
  WEEKDAY_LABELS,
} from "@/lib/constants/court-labels";
import { RECIFE_NEIGHBORHOODS } from "@/lib/constants/recife-neighborhoods";
import { createCourtAction } from "./actions";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass = "flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default async function NovaQuadraPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Cadastrar quadra
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Ajude a comunidade cadastrando uma quadra pública ou privada em Recife.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form id="court-form" action={createCourtAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="latitude" defaultValue="" />
        <input type="hidden" name="longitude" defaultValue="" />

        <label className={labelClass}>
          Nome da quadra
          <input type="text" name="name" required className={inputClass} />
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
          Tipo de quadra
          <select
            name="courtType"
            defaultValue={CourtType.PUBLIC_UNOFFICIAL}
            className={inputClass}
          >
            {Object.values(CourtType).map((type) => (
              <option key={type} value={type}>
                {COURT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Como funciona a reserva
          <select
            name="bookingMode"
            defaultValue={BookingMode.INFORMATIONAL}
            className={inputClass}
          >
            {Object.values(BookingMode).map((mode) => (
              <option key={mode} value={mode}>
                {BOOKING_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Link oficial de reserva (se houver)
          <input
            type="url"
            name="officialBookingUrl"
            placeholder="https://…"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Instruções de reserva (se não houver sistema)
          <textarea
            name="bookingInstructions"
            rows={2}
            maxLength={500}
            placeholder="Ex.: ligue para a administração do clube."
            className={`resize-none ${inputClass}`}
          />
        </label>

        <label className={labelClass}>
          Piso
          <select name="surfaceType" defaultValue={SurfaceType.QUADRA_DURA} className={inputClass}>
            {Object.values(SurfaceType).map((type) => (
              <option key={type} value={type}>
                {SURFACE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="isLighted"
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
            />
            Iluminada
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="isIndoor"
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
            />
            Coberta
          </label>
        </div>

        <label className={labelClass}>
          Preço por hora (R$, deixe em branco se não souber)
          <input type="number" name="hourlyPrice" min={0} step="1" className={inputClass} />
        </label>

        <label className={labelClass}>
          Endereço
          <input type="text" name="address" required className={inputClass} />
        </label>

        <label className={labelClass}>
          Bairro
          <select name="neighborhood" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Selecione…
            </option>
            {RECIFE_NEIGHBORHOODS.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </label>

        <div className={labelClass}>
          Localização (obrigatório para aparecer no mapa)
          <LocationButton initialLatitude={null} initialLongitude={null} />
        </div>

        <label className={labelClass}>
          Telefone de contato
          <input type="tel" name="phone" className={inputClass} />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Horário de funcionamento
          </legend>
          <div className="flex flex-col gap-2">
            {WEEKDAY_LABELS.map((label, day) => (
              <div
                key={day}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-sm"
              >
                <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
                <input
                  type="time"
                  name={`opensAt_${day}`}
                  defaultValue="08:00"
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <input
                  type="time"
                  name={`closesAt_${day}`}
                  defaultValue="22:00"
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <label className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <input type="checkbox" name={`closed_${day}`} className="h-3.5 w-3.5" />
                  Fechado
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Fotos (link de imagens, opcional)
          </legend>
          <input type="url" name="photoUrl" placeholder="https://…" className={inputClass} />
          <input type="url" name="photoUrl" placeholder="https://…" className={inputClass} />
          <input type="url" name="photoUrl" placeholder="https://…" className={inputClass} />
        </fieldset>

        <button
          type="submit"
          className="mt-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Cadastrar quadra
        </button>
      </form>
    </div>
  );
}
