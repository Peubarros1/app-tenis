import { AppError } from "./app-error";

export class PlayerNotRateableError extends AppError {
  readonly code = "PLAYER_NOT_RATEABLE";

  constructor() {
    super("Você só pode avaliar jogadores que estiveram confirmados com você nesta partida.");
  }
}
