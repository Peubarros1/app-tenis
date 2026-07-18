import { ChatAccessDeniedError } from "@/domain/errors/chat-access-denied-error";
import type {
  MatchMessageItem,
  MatchMessageRepository,
} from "@/domain/repositories/match-message-repository";

export class SendMatchMessage {
  constructor(private readonly matchMessageRepository: MatchMessageRepository) {}

  async execute(matchId: string, userId: string, content: string): Promise<MatchMessageItem> {
    const isConfirmed = await this.matchMessageRepository.isConfirmedParticipant(matchId, userId);
    if (!isConfirmed) throw new ChatAccessDeniedError();

    return this.matchMessageRepository.send(matchId, userId, content);
  }
}
