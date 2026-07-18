import { NotificationType } from "@/generated/prisma/client";
import type { FriendshipRepository } from "@/domain/repositories/friendship-repository";
import type { NotificationRepository } from "@/domain/repositories/notification-repository";

export class RespondToFriendRequest {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    friendshipId: string,
    userId: string,
    userName: string | null,
    accept: boolean,
  ): Promise<void> {
    const { requesterId } = await this.friendshipRepository.respond(friendshipId, userId, accept);

    if (accept) {
      await this.notificationRepository.create(requesterId, NotificationType.FRIEND_ACCEPTED, {
        fromUserId: userId,
        fromUserName: userName,
      });
    }
  }
}
