import { AppError } from "./app-error";

export class OverlappingBookingError extends AppError {
  readonly code = "OVERLAPPING_BOOKING";

  constructor() {
    super("Esse horário já está reservado. Escolha outro horário.");
  }
}
