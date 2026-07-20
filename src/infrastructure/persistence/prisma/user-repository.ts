import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import type {
  AuthUser,
  CreateUserInput,
  UserRepository,
} from "@/domain/repositories/user-repository";
import { prisma } from "./client";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<AuthUser | null> {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true, passwordHash: true },
    });
  }

  async create(input: CreateUserInput): Promise<AuthUser> {
    return prisma.user.create({
      data: input,
      select: { id: true, name: true, email: true, image: true, passwordHash: true },
    });
  }

  isUniqueEmailViolation(error: unknown): boolean {
    return (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      (error.meta?.target as string[] | undefined)?.includes("email") === true
    );
  }
}
