"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AddCourtReview } from "@/application/use-cases/add-court-review";
import { PrismaCourtRepository } from "@/infrastructure/persistence/prisma/court-repository";
import { auth } from "@/lib/auth";
import { courtReviewSchema } from "@/lib/validation/court";

export async function addCourtReviewAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const courtId = formData.get("courtId");
  if (typeof courtId !== "string" || !courtId) return;

  const parsed = courtReviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/quadras/${courtId}?error=${encodeURIComponent(message)}`);
  }

  const addCourtReview = new AddCourtReview(new PrismaCourtRepository());
  await addCourtReview.execute(courtId, session.user.id, parsed.data);

  revalidatePath(`/quadras/${courtId}`);
  redirect(`/quadras/${courtId}`);
}
