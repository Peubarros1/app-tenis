import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-6 py-24">
      <h1 className="max-w-lg text-4xl leading-tight font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Encontre quadras e jogue tênis em Recife.
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Quadras públicas e privadas, organização de partidas e reservas — tudo em um só lugar.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        {session?.user ? (
          <Link
            href="/conta"
            className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Ir para minha conta
          </Link>
        ) : (
          <>
            <Link
              href="/registro"
              className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Criar conta
            </Link>
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Já tenho conta
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
