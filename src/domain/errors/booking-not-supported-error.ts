import { AppError } from "./app-error";

export class BookingNotSupportedError extends AppError {
  readonly code = "BOOKING_NOT_SUPPORTED";

  constructor() {
    super("Esta quadra não aceita reservas organizadas pela plataforma.");
  }
}
