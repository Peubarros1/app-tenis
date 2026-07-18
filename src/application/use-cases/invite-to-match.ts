import type { MatchRepository } from "@/domain/repositories/match-repository";

export class InviteToMatch {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(matchId: string, organizerId: string, inviteeEmail: string): Promise<void> {
    await this.matchRepository.invite(matchId, organizerId, inviteeEmail);
  }
}
