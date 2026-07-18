import { AppError } from "./app-error";

export class CannotFriendSelfError extends AppError {
  readonly code = "CANNOT_FRIEND_SELF";

  constructor() {
    super("Você não pode adicionar a si mesmo como amigo.");
  }
}
