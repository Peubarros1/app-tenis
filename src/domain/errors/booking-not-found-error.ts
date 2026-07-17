import { AppError } from "./app-error";

export class BookingNotFoundError extends AppError {
  readonly code = "BOOKING_NOT_FOUND";

  constructor() {
    super("Reserva não encontrada.");
  }
}
