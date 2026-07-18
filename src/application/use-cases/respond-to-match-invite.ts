import type { MatchRepository } from "@/domain/repositories/match-repository";

export class RespondToMatchInvite {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(matchId: string, userId: string, accept: boolean): Promise<void> {
    await this.matchRepository.respondToInvite(matchId, userId, accept);
  }
}
