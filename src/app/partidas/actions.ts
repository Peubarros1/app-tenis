"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CancelMatch } from "@/application/use-cases/cancel-match";
import { InviteToMatch } from "@/application/use-cases/invite-to-match";
import { JoinMatch } from "@/application/use-cases/join-match";
import { LeaveMatch } from "@/application/use-cases/leave-match";
import { RespondToMatchInvite } from "@/application/use-cases/respond-to-match-invite";
import { AppError } from "@/domain/errors/app-error";
import { PrismaMatchRepository } from "@/infrastructure/persistence/prisma/match-repository";
import { PrismaNotificationRepository } from "@/infrastructure/persistence/prisma/notification-repository";
import { auth } from "@/lib/auth";
import { inviteToMatchSchema } from "@/lib/validation/match";

function getMatchId(formData: FormData): string | null {
  const matchId = formData.get("matchId");
  return typeof matchId === "string" && matchId ? matchId : null;
}

export async function joinMatchAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matchId = getMatchId(formData);
  if (!matchId) return;

  try {
    await new JoinMatch(new PrismaMatchRepository()).execute(matchId, session.user.id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/partidas/${matchId}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  redirect(`/partidas/${matchId}`);
}

export async function leaveMatchAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matchId = getMatchId(formData);
  if (!matchId) return;

  try {
    await new LeaveMatch(new PrismaMatchRepository()).execute(matchId, session.user.id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/partidas/${matchId}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  redirect(`/partidas/${matchId}`);
}

export async function cancelMatchAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matchId = getMatchId(formData);
  if (!matchId) return;

  try {
    await new CancelMatch(new PrismaMatchRepository(), new PrismaNotificationRepository()).execute(
      matchId,
      session.user.id,
    );
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/partidas/${matchId}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  redirect(`/partidas/${matchId}`);
}

export async function inviteToMatchAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matchId = getMatchId(formData);
  if (!matchId) return;

  const parsed = inviteToMatchSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "E-mail inválido.";
    redirect(`/partidas/${matchId}?error=${encodeURIComponent(message)}`);
  }

  try {
    await new InviteToMatch(
      new PrismaMatchRepository(),
      new PrismaNotificationRepository(),
    ).execute(matchId, session.user.id, parsed.data.email);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/partidas/${matchId}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/partidas/${matchId}`);
  redirect(`/partidas/${matchId}?invited=1`);
}

export async function respondToMatchInviteAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matchId = getMatchId(formData);
  if (!matchId) return;
  const accept = formData.get("accept") === "1";

  try {
    await new RespondToMatchInvite(new PrismaMatchRepository()).execute(
      matchId,
      session.user.id,
      accept,
    );
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/partidas?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  redirect(accept ? `/partidas/${matchId}` : "/partidas");
}
