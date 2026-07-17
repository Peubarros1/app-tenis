import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export default async function ContaPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Minha conta
      </h1>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <dt className="text-zinc-500 dark:text-zinc-400">Nome</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">
            {session?.user.name ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <dt className="text-zinc-500 dark:text-zinc-400">E-mail</dt>
          <dd className="font-medium text-zinc-950 dark:text-zinc-50">{session?.user.email}</dd>
        </div>
      </dl>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        A edição completa do perfil (nível técnico, foto, localização, quadras favoritas) chega na
        Etapa 4.
      </p>

      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
