import type { FriendshipRepository } from "@/domain/repositories/friendship-repository";

export class RemoveFriend {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<void> {
    await this.friendshipRepository.remove(friendshipId, userId);
  }
}
