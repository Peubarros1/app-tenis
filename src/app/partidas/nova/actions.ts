"use server";

import { redirect } from "next/navigation";
import { CreateMatch } from "@/application/use-cases/create-match";
import { PrismaMatchRepository } from "@/infrastructure/persistence/prisma/match-repository";
import { auth } from "@/lib/auth";
import { recifeWallClockToDate } from "@/lib/datetime";
import { createMatchSchema } from "@/lib/validation/match";

export async function createMatchAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = createMatchSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    courtId: formData.get("courtId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    durationMinutes: formData.get("durationMinutes"),
    minSkillLevel: formData.get("minSkillLevel"),
    maxSkillLevel: formData.get("maxSkillLevel"),
    maxPlayers: formData.get("maxPlayers"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    redirect(`/partidas/nova?error=${encodeURIComponent(message)}`);
  }

  const scheduledAt = recifeWallClockToDate(parsed.data.date, parsed.data.startTime);

  const createMatch = new CreateMatch(new PrismaMatchRepository());
  const match = await createMatch.execute(session.user.id, {
    title: parsed.data.title,
    description: parsed.data.description,
    courtId: parsed.data.courtId,
    minSkillLevel: parsed.data.minSkillLevel,
    maxSkillLevel: parsed.data.maxSkillLevel,
    durationMinutes: parsed.data.durationMinutes,
    maxPlayers: parsed.data.maxPlayers,
    visibility: parsed.data.visibility,
    scheduledAt,
  });

  redirect(`/partidas/${match.id}`);
}
