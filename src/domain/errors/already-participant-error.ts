import { AppError } from "./app-error";

export class AlreadyParticipantError extends AppError {
  readonly code = "ALREADY_PARTICIPANT";

  constructor() {
    super("Você já está nesta partida.");
  }
}
