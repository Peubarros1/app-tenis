import { Bell } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { PrismaNotificationRepository } from "@/infrastructure/persistence/prisma/notification-repository";
import { PrismaPlayerRepository } from "@/infrastructure/persistence/prisma/player-repository";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export async function SiteHeader() {
  const session = await auth();
  // Busca o perfil fresco do banco (não confia no image/name em cache do
  // JWT da sessão, que só é atualizado no login e ficaria desatualizado
  // se o usuário trocasse a foto depois).
  const [unreadCount, profile] = session?.user
    ? await Promise.all([
        new PrismaNotificationRepository().countUnread(session.user.id),
        new PrismaPlayerRepository().findById(session.user.id),
      ])
    : [0, null];

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
                aria-label="Notificações"
                className="relative inline-flex shrink-0 items-center text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <Bell className="size-[18px]" aria-hidden />
                {unreadCount > 0 && (
                  <span className="bg-accent-500 absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/conta"
                className="flex shrink-0 items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <Avatar src={profile?.image} name={profile?.name ?? session.user.name} size="xs" />
                <span className="max-w-24 truncate whitespace-nowrap sm:max-w-none">
                  {profile?.name ?? session.user.name ?? session.user.email}
                </span>
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
