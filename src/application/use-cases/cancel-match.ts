import type { MatchRepository } from "@/domain/repositories/match-repository";

export class CancelMatch {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(matchId: string, organizerId: string): Promise<void> {
    await this.matchRepository.cancel(matchId, organizerId);
  }
}
