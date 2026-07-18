import { AppError } from "./app-error";

export class UserNotFoundError extends AppError {
  readonly code = "USER_NOT_FOUND";

  constructor() {
    super("Não encontramos nenhum jogador cadastrado com esse e-mail.");
  }
}
