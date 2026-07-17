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
