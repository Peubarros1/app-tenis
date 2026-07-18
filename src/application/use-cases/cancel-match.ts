import { NotificationType } from "@/generated/prisma/client";
import type { MatchRepository } from "@/domain/repositories/match-repository";
import type { NotificationRepository } from "@/domain/repositories/notification-repository";

export class CancelMatch {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(matchId: string, organizerId: string): Promise<void> {
    const { notifiedUserIds, matchTitle } = await this.matchRepository.cancel(matchId, organizerId);

    await this.notificationRepository.createMany(
      notifiedUserIds,
      NotificationType.MATCH_CANCELLED,
      {
        matchId,
        matchTitle,
      },
    );
  }
}
