import { AppError } from "./app-error";

export class ForbiddenMatchActionError extends AppError {
  readonly code = "FORBIDDEN_MATCH_ACTION";

  constructor(message = "Só o organizador pode fazer isso.") {
    super(message);
  }
}
