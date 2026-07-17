import { AppError } from "./app-error";

export class EmailAlreadyInUseError extends AppError {
  readonly code = "EMAIL_ALREADY_IN_USE";

  constructor(email: string) {
    super(`Já existe uma conta com o e-mail ${email}.`);
  }
}
