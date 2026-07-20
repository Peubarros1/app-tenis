import type { SkillLevel } from "@/generated/prisma/client";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  passwordHash: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  skillLevel: SkillLevel;
}

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  create(input: CreateUserInput): Promise<AuthUser>;
  /** Distingue a violação da constraint @unique de e-mail de qualquer outro erro do `create`. */
  isUniqueEmailViolation(error: unknown): boolean;
}
