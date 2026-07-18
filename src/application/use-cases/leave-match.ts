import type { MatchRepository } from "@/domain/repositories/match-repository";

export class LeaveMatch {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(matchId: string, userId: string): Promise<void> {
    await this.matchRepository.leave(matchId, userId);
  }
}
