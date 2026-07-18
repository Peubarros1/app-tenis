import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaNotificationRepository } from "@/infrastructure/persistence/prisma/notification-repository";
import { auth } from "@/lib/auth";
import { formatRecifeFullDateTime } from "@/lib/datetime";
import { describeNotification } from "@/lib/notifications";
import { markAllNotificationsReadAction, markNotificationReadAction } from "./actions";

export default async function NotificacoesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const notifications = await new PrismaNotificationRepository().listForUser(session.user.id);
  const hasUnread = notifications.some((notification) => !notification.readAt);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Notificações
        </h1>
        {hasUnread && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="text-sm font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Marcar todas como lidas
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Você ainda não tem notificações.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {notifications.map((notification) => {
            const { text, href } = describeNotification(notification.type, notification.payload);
            const isUnread = !notification.readAt;

            return (
              <li key={notification.id}>
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="notificationId" value={notification.id} />
                  <input type="hidden" name="redirectTo" value={href ?? "/notificacoes"} />
                  <button
                    type="submit"
                    className={`flex w-full flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition-colors ${
                      isUnread
                        ? "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <span className="text-zinc-950 dark:text-zinc-50">
                      {isUnread && (
                        <span className="mr-1.5 text-zinc-900 dark:text-zinc-50">●</span>
                      )}
                      {text}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatRecifeFullDateTime(notification.createdAt)}
                    </span>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/amigos" className="underline underline-offset-2">
          Gerenciar amigos
        </Link>
      </p>
    </div>
  );
}
