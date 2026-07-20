import Link from "next/link";
import { Logo } from "@/components/logo";
import { PrismaNotificationRepository } from "@/infrastructure/persistence/prisma/notification-repository";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export async function SiteHeader() {
  const session = await auth();
  const unreadCount = session?.user
    ? await new PrismaNotificationRepository().countUnread(session.user.id)
    : 0;

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="shrink-0">
          <Logo wordmarkClassName="text-base sm:text-lg" />
        </Link>

        <nav className="scrollbar-hide flex min-w-0 items-center gap-3 overflow-x-auto text-sm font-medium sm:gap-4">
          <Link
            href="/quadras"
            className="shrink-0 whitespace-nowrap text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Quadras
          </Link>
          <Link
            href="/partidas"
            className="shrink-0 whitespace-nowrap text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Partidas
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/reservas"
                className="shrink-0 whitespace-nowrap text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                Reservas
              </Link>
              <Link
                href="/amigos"
                className="shrink-0 whitespace-nowrap text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                Amigos
              </Link>
              <Link
                href="/notificacoes"
                className="shrink-0 whitespace-nowrap text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                🔔{unreadCount > 0 ? ` ${unreadCount}` : ""}
              </Link>
              <Link
                href="/conta"
                className="max-w-24 shrink-0 truncate whitespace-nowrap text-zinc-700 hover:text-zinc-950 sm:max-w-none dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {session.user.name ?? session.user.email}
              </Link>
              <form action={signOutAction} className="shrink-0">
                <button
                  type="submit"
                  className="whitespace-nowrap text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="shrink-0 whitespace-nowrap text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 whitespace-nowrap text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
