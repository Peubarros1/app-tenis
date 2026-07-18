import { AppError } from "./app-error";

export class FriendRequestAlreadyExistsError extends AppError {
  readonly code = "FRIEND_REQUEST_ALREADY_EXISTS";

  constructor() {
    super("Vocês já são amigos ou já existe um pedido pendente entre vocês.");
  }
}
