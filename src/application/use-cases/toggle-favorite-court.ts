import type { CourtRepository } from "@/domain/repositories/court-repository";

export class ToggleFavoriteCourt {
  constructor(private readonly courtRepository: CourtRepository) {}

  async execute(courtId: string, userId: string): Promise<boolean> {
    return this.courtRepository.toggleFavorite(courtId, userId);
  }
}
