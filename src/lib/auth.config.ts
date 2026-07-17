import type { NextAuthConfig } from "next-auth";

/**
 * Configuração "edge-safe": sem adapter Prisma nem bcrypt, para poder rodar
 * no Edge Runtime do middleware. A configuração completa (com providers e
 * adapter) fica em `auth.ts`, que estende esta aqui.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
