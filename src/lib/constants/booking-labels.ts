import { BookingStatus } from "@/generated/prisma/client";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pendente",
  [BookingStatus.CONFIRMED]: "Confirmada",
  [BookingStatus.CANCELLED]: "Cancelada",
  [BookingStatus.COMPLETED]: "Concluída",
};
