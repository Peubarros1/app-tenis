import { AppError } from "./app-error";

export class NotAParticipantError extends AppError {
  readonly code = "NOT_A_PARTICIPANT";

  constructor() {
    super("Você não está nesta partida.");
  }
}
