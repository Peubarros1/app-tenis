"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RatePlayer } from "@/application/use-cases/rate-player";
import { AppError } from "@/domain/errors/app-error";
import { PrismaPlayerRatingRepository } from "@/infrastructure/persistence/prisma/player-rating-repository";
import { auth } from "@/lib/auth";
import { ratePlayerSchema } from "@/lib/validation/player-rating";

export async function ratePlayerAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matchId = formData.get("matchId");
  if (typeof matchId !== "string" || !matchId) return;

  const parsed = ratePlayerSchema.safeParse({
    ratedUserId: formData.get("ratedUserId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/partidas/${matchId}?ratingError=${encodeURIComponent(message)}`);
  }

  try {
    await new RatePlayer(new PrismaPlayerRatingRepository()).execute(
      matchId,
      session.user.id,
      parsed.data.ratedUserId,
      parsed.data.rating,
      parsed.data.comment || null,
    );
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/partidas/${matchId}?ratingError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/partidas/${matchId}`);
  redirect(`/partidas/${matchId}?ratingSuccess=1`);
}
