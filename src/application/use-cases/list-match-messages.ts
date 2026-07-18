import { ChatAccessDeniedError } from "@/domain/errors/chat-access-denied-error";
import type {
  MatchMessageItem,
  MatchMessageRepository,
} from "@/domain/repositories/match-message-repository";

export class ListMatchMessages {
  constructor(private readonly matchMessageRepository: MatchMessageRepository) {}

  async execute(matchId: string, userId: string): Promise<MatchMessageItem[]> {
    const isConfirmed = await this.matchMessageRepository.isConfirmedParticipant(matchId, userId);
    if (!isConfirmed) throw new ChatAccessDeniedError();

    return this.matchMessageRepository.listForMatch(matchId);
  }
}
