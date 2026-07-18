import { AppError } from "./app-error";

export class FriendRequestNotFoundError extends AppError {
  readonly code = "FRIEND_REQUEST_NOT_FOUND";

  constructor() {
    super("Pedido de amizade não encontrado.");
  }
}
