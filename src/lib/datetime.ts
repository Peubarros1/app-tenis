/**
 * Recife (America/Recife) fica em UTC-3 o ano todo (Brasil não tem mais
 * horário de verão desde 2019). Enquanto o produto for só de Recife, tratamos
 * todo horário do app como "horário de parede" local, guardado no banco como
 * se fosse UTC — sem nenhuma conversão de fuso. Contanto que toda leitura e
 * escrita passe por estas funções, os valores são consistentes de ponta a
 * ponta. Se o produto expandir para outras cidades/fusos, isso precisa virar
 * um fuso por cidade (ex.: coluna timezone na quadra) em vez desta constante.
 */
const RECIFE_UTC_OFFSET_HOURS = 3;

export function recifeWallClockToDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

export function nowAsRecifeWallClock(): Date {
  return new Date(Date.now() - RECIFE_UTC_OFFSET_HOURS * 60 * 60 * 1000);
}

export function formatRecifeDateTime(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

/**
 * Para timestamps GENUÍNOS em UTC (ex.: `createdAt` gerado pelo `now()` do
 * Postgres) — diferente de `formatRecifeDateTime`, que é só para os campos
 * que NÓS construímos como "hora de parede disfarçada de UTC" (agendamento
 * de reserva/partida). Aqui a conversão de fuso é de verdade.
 */
export function formatRecifeTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    timeZone: "America/Recife",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Igual a `formatRecifeTime`, mas com data completa — para timestamps GENUÍNOS em UTC. */
export function formatRecifeFullDateTime(date: Date): string {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Recife",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/** "há 3 dias" etc, para timestamps GENUÍNOS em UTC (ex.: `createdAt`). */
export function formatRelativeDate(date: Date): string {
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return RELATIVE_TIME_FORMATTER.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return RELATIVE_TIME_FORMATTER.format(diffSeconds, "second");
}
