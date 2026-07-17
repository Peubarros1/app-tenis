import { AppError } from "./app-error";

export class PastBookingError extends AppError {
  readonly code = "PAST_BOOKING";

  constructor() {
    super("Não é possível reservar um horário no passado.");
  }
}
