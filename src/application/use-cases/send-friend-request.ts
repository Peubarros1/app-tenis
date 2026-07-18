import { NotificationType } from "@/generated/prisma/client";
import type { FriendshipRepository } from "@/domain/repositories/friendship-repository";
import type { NotificationRepository } from "@/domain/repositories/notification-repository";

export class SendFriendRequest {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    requesterId: string,
    requesterName: string | null,
    addresseeEmail: string,
  ): Promise<void> {
    const { addresseeId } = await this.friendshipRepository.sendRequest(
      requesterId,
      addresseeEmail,
    );

    await this.notificationRepository.create(addresseeId, NotificationType.FRIEND_REQUEST, {
      fromUserId: requesterId,
      fromUserName: requesterName,
    });
  }
}
