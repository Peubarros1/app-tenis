import { AppError } from "./app-error";

export class MatchNotEndedError extends AppError {
  readonly code = "MATCH_NOT_ENDED";

  constructor() {
    super("Só é possível avaliar jogadores depois que a partida termina.");
  }
}
