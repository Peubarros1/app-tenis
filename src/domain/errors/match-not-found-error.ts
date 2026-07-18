import { AppError } from "./app-error";

export class MatchNotFoundError extends AppError {
  readonly code = "MATCH_NOT_FOUND";

  constructor() {
    super("Partida não encontrada.");
  }
}
