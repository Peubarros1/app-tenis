import { AppError } from "./app-error";

export class MatchNotOpenError extends AppError {
  readonly code = "MATCH_NOT_OPEN";

  constructor() {
    super("Esta partida não está mais aceitando jogadores.");
  }
}
