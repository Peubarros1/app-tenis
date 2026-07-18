import { ParticipantStatus } from "@/generated/prisma/client";
import type {
  MatchMessageItem,
  MatchMessageRepository,
} from "@/domain/repositories/match-message-repository";
import { prisma } from "./client";

export class PrismaMatchMessageRepository implements MatchMessageRepository {
  async isConfirmedParticipant(matchId: string, userId: string): Promise<boolean> {
    const participant = await prisma.matchParticipant.findUnique({
      where: { matchId_userId: { matchId, userId } },
      select: { status: true },
    });
    return participant?.status === ParticipantStatus.CONFIRMED;
  }

  async listForMatch(matchId: string): Promise<MatchMessageItem[]> {
    const messages = await prisma.matchMessage.findMany({
      where: { matchId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true } },
      },
    });

    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      userId: message.userId,
      userName: message.user.name,
    }));
  }

  async send(matchId: string, userId: string, content: string): Promise<MatchMessageItem> {
    const message = await prisma.matchMessage.create({
      data: { matchId, userId, content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true } },
      },
    });

    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      userId: message.userId,
      userName: message.user.name,
    };
  }
}
