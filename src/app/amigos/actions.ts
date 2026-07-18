"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RemoveFriend } from "@/application/use-cases/remove-friend";
import { RespondToFriendRequest } from "@/application/use-cases/respond-to-friend-request";
import { SendFriendRequest } from "@/application/use-cases/send-friend-request";
import { AppError } from "@/domain/errors/app-error";
import { PrismaFriendshipRepository } from "@/infrastructure/persistence/prisma/friendship-repository";
import { PrismaNotificationRepository } from "@/infrastructure/persistence/prisma/notification-repository";
import { auth } from "@/lib/auth";
import { sendFriendRequestSchema } from "@/lib/validation/friend";

export async function sendFriendRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = sendFriendRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "E-mail inválido.";
    redirect(`/amigos?error=${encodeURIComponent(message)}`);
  }

  try {
    await new SendFriendRequest(
      new PrismaFriendshipRepository(),
      new PrismaNotificationRepository(),
    ).execute(session.user.id, session.user.name ?? null, parsed.data.email);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/amigos?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/amigos");
  redirect("/amigos?sent=1");
}

export async function respondToFriendRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const friendshipId = formData.get("friendshipId");
  if (typeof friendshipId !== "string" || !friendshipId) return;
  const accept = formData.get("accept") === "1";

  try {
    await new RespondToFriendRequest(
      new PrismaFriendshipRepository(),
      new PrismaNotificationRepository(),
    ).execute(friendshipId, session.user.id, session.user.name ?? null, accept);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/amigos?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/amigos");
  redirect("/amigos");
}

export async function removeFriendAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const friendshipId = formData.get("friendshipId");
  if (typeof friendshipId !== "string" || !friendshipId) return;

  try {
    await new RemoveFriend(new PrismaFriendshipRepository()).execute(friendshipId, session.user.id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/amigos?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/amigos");
  redirect("/amigos");
}
