import { AppError } from "./app-error";

export class ChatAccessDeniedError extends AppError {
  readonly code = "CHAT_ACCESS_DENIED";

  constructor() {
    super("Você precisa estar confirmado na partida para acessar o chat.");
  }
}
