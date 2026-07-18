import type { ParticipantStatus } from "@/generated/prisma/client";
import type { MatchRepository } from "@/domain/repositories/match-repository";

export class JoinMatch {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(matchId: string, userId: string): Promise<ParticipantStatus> {
    return this.matchRepository.join(matchId, userId);
  }
}
