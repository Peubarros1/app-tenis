"use server";

import { ListMatchMessages } from "@/application/use-cases/list-match-messages";
import { SendMatchMessage } from "@/application/use-cases/send-match-message";
import { AppError } from "@/domain/errors/app-error";
import { PrismaMatchMessageRepository } from "@/infrastructure/persistence/prisma/match-message-repository";
import { auth } from "@/lib/auth";
import { sendMessageSchema } from "@/lib/validation/chat";

export interface ChatMessageDTO {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string | null;
}

export async function getMatchMessagesAction(matchId: string): Promise<ChatMessageDTO[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const messages = await new ListMatchMessages(new PrismaMatchMessageRepository()).execute(
      matchId,
      session.user.id,
    );
    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      userId: message.userId,
      userName: message.userName,
    }));
  } catch {
    return [];
  }
}

export async function sendMatchMessageAction(
  matchId: string,
  content: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Você precisa entrar na sua conta." };
  }

  const parsed = sendMessageSchema.safeParse({ content });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Mensagem inválida." };
  }

  try {
    await new SendMatchMessage(new PrismaMatchMessageRepository()).execute(
      matchId,
      session.user.id,
      parsed.data.content,
    );
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}
