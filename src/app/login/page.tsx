import Link from "next/link";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Entrar
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Acesse sua conta para organizar e entrar em partidas.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          E-mail ou senha incorretos.
        </p>
      )}

      <form action={loginAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/conta"} />
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          E-mail
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Senha
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <AuthSubmitButton label="Entrar" pendingLabel="Entrando…" />
      </form>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Ainda não tem conta?{" "}
        <Link
          href="/registro"
          className="font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
