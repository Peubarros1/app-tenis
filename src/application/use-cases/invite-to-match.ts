import { NotificationType } from "@/generated/prisma/client";
import type { MatchRepository } from "@/domain/repositories/match-repository";
import type { NotificationRepository } from "@/domain/repositories/notification-repository";

export class InviteToMatch {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(matchId: string, organizerId: string, inviteeEmail: string): Promise<void> {
    const { inviteeId, matchTitle } = await this.matchRepository.invite(
      matchId,
      organizerId,
      inviteeEmail,
    );

    await this.notificationRepository.create(inviteeId, NotificationType.MATCH_INVITE, {
      matchId,
      matchTitle,
    });
  }
}
