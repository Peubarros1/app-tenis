"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PrismaNotificationRepository } from "@/infrastructure/persistence/prisma/notification-repository";
import { auth } from "@/lib/auth";

export async function markNotificationReadAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notificationId = formData.get("notificationId");
  if (typeof notificationId !== "string" || !notificationId) return;
  const redirectTo = formData.get("redirectTo");

  await new PrismaNotificationRepository().markRead(notificationId, session.user.id);

  revalidatePath("/notificacoes");
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/notificacoes");
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await new PrismaNotificationRepository().markAllRead(session.user.id);

  revalidatePath("/notificacoes");
  redirect("/notificacoes");
}
