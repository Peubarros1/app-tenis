import { redirect } from "next/navigation";
import { PrismaFriendshipRepository } from "@/infrastructure/persistence/prisma/friendship-repository";
import { SKILL_LEVEL_LABELS } from "@/lib/constants/skill-level-labels";
import { auth } from "@/lib/auth";
import {
  removeFriendAction,
  respondToFriendRequestAction,
  sendFriendRequestAction,
} from "./actions";

export default async function AmigosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { error, sent } = await searchParams;

  const friendshipRepository = new PrismaFriendshipRepository();
  const [friends, incoming, outgoing] = await Promise.all([
    friendshipRepository.listFriends(session.user.id),
    friendshipRepository.listIncomingRequests(session.user.id),
    friendshipRepository.listOutgoingRequests(session.user.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Amigos
        </h1>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        {sent && (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Pedido de amizade enviado.
          </p>
        )}

        <form action={sendFriendRequestAction} className="mt-4 flex items-end gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Adicionar amigo por e-mail
            <input
              type="email"
              name="email"
              placeholder="jogador@email.com"
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Convidar
          </button>
        </form>
      </div>

      {incoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Pedidos recebidos
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {incoming.map((request) => (
              <li
                key={request.friendshipId}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <span className="text-zinc-950 dark:text-zinc-50">
                  {request.name ?? request.email}
                </span>
                <div className="flex shrink-0 gap-2">
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={request.friendshipId} />
                    <input type="hidden" name="accept" value="1" />
                    <button
                      type="submit"
                      className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      Aceitar
                    </button>
                  </form>
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={request.friendshipId} />
                    <input type="hidden" name="accept" value="0" />
                    <button
                      type="submit"
                      className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
                    >
                      Recusar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Pedidos enviados
          </h2>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {outgoing.map((request) => (
              <li
                key={request.friendshipId}
                className="flex justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <span className="text-zinc-700 dark:text-zinc-300">
                  {request.name ?? request.email}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">Pendente</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Seus amigos
        </h2>
        {friends.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Você ainda não tem amigos na plataforma. Convide alguém pelo e-mail acima.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {friends.map((friend) => (
              <li
                key={friend.friendshipId}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <div>
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">
                    {friend.name ?? friend.email}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {SKILL_LEVEL_LABELS[friend.skillLevel]}
                  </p>
                </div>
                <form action={removeFriendAction}>
                  <input type="hidden" name="friendshipId" value={friend.friendshipId} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
                  >
                    Remover
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
