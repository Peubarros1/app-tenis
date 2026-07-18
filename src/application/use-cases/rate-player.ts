import type { PlayerRatingRepository } from "@/domain/repositories/player-rating-repository";

export class RatePlayer {
  constructor(private readonly playerRatingRepository: PlayerRatingRepository) {}

  async execute(
    matchId: string,
    raterId: string,
    ratedUserId: string,
    rating: number,
    comment: string | null,
  ): Promise<void> {
    await this.playerRatingRepository.rate(matchId, raterId, ratedUserId, rating, comment);
  }
}
