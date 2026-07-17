"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UpdatePlayerProfile } from "@/application/use-cases/update-player-profile";
import { PrismaPlayerRepository } from "@/infrastructure/persistence/prisma/player-repository";
import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validation/profile";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const latitude = formData.get("latitude");
  const longitude = formData.get("longitude");

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    phone: formData.get("phone"),
    image: formData.get("image"),
    skillLevel: formData.get("skillLevel"),
    neighborhood: formData.get("neighborhood"),
    latitude: latitude || undefined,
    longitude: longitude || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/conta?error=${encodeURIComponent(message)}`);
  }

  const updatePlayerProfile = new UpdatePlayerProfile(new PrismaPlayerRepository());
  await updatePlayerProfile.execute(session.user.id, parsed.data);

  revalidatePath("/conta");
  redirect("/conta?success=1");
}
