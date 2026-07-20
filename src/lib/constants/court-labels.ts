import { BookingMode, CourtType, SurfaceType } from "@/generated/prisma/enums";

export const SURFACE_TYPE_LABELS: Record<SurfaceType, string> = {
  [SurfaceType.SAIBRO]: "Saibro",
  [SurfaceType.QUADRA_DURA]: "Quadra dura",
  [SurfaceType.GRAMA_SINTETICA]: "Grama sintética",
  [SurfaceType.CARPETE]: "Carpete",
  [SurfaceType.CONCRETO]: "Concreto",
  [SurfaceType.OUTRO]: "Outro",
};

export const COURT_TYPE_LABELS: Record<CourtType, string> = {
  [CourtType.PUBLIC_OFFICIAL]: "Pública (com sistema oficial de agendamento)",
  [CourtType.PUBLIC_UNOFFICIAL]: "Pública (sem sistema de agendamento)",
  [CourtType.PRIVATE]: "Privada",
};

export const BOOKING_MODE_LABELS: Record<BookingMode, string> = {
  [BookingMode.OFFICIAL_INTEGRATION]: "Reserva pelo sistema oficial (link externo)",
  [BookingMode.INTERNAL]: "Reserva organizada por aqui",
  [BookingMode.INFORMATIONAL]: "Apenas informativo (sem reserva)",
};

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;
