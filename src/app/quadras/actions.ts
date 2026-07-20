"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ToggleFavoriteCourt } from "@/application/use-cases/toggle-favorite-court";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { auth } from "@/lib/auth";

export async function toggleFavoriteCourtAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const courtId = formData.get("courtId");
  const redirectTo = formData.get("redirectTo");
  if (typeof courtId !== "string" || !courtId) return;

  const toggleFavoriteCourt = new ToggleFavoriteCourt(new PrismaCourtRepository());
  await toggleFavoriteCourt.execute(courtId, session.user.id);

  revalidatePath("/quadras");
  revalidatePath(`/quadras/${courtId}`);
  revalidatePath("/conta");

  if (typeof redirectTo === "string" && redirectTo) {
    redirect(redirectTo);
  }
}

/**
 * Mesma ação, mas invocada como RPC (não ligada a um <form>) por componentes
 * client-side que querem atualização otimista sem navegação — ex.: o botão
 * de favorito no card da busca instantânea.
 */
export async function toggleFavoriteCourtRpcAction(
  courtId: string,
): Promise<{ favorited: boolean }> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }

  const toggleFavoriteCourt = new ToggleFavoriteCourt(new PrismaCourtRepository());
  const favorited = await toggleFavoriteCourt.execute(courtId, session.user.id);

  revalidatePath("/quadras");
  revalidatePath(`/quadras/${courtId}`);
  revalidatePath("/conta");

  return { favorited };
}
