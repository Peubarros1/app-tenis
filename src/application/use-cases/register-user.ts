import bcrypt from "bcryptjs";
import { SkillLevel } from "@/generated/prisma/client";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use-error";
import type { AuthUser, UserRepository } from "@/domain/repositories/user-repository";
import type { RegisterInput } from "@/lib/validation/auth";

const PASSWORD_SALT_ROUNDS = 12;

export class RegisterUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterInput): Promise<AuthUser> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyInUseError(input.email);
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    return this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      skillLevel: SkillLevel.INICIANTE,
    });
  }
}
