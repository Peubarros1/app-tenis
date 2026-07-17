import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Instância mínima do NextAuth usada apenas pelo middleware (Edge Runtime).
 * Só decodifica o JWT da sessão — não toca em Prisma/bcrypt.
 */
export const { auth } = NextAuth(authConfig);
