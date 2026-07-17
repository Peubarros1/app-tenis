import type { CourtRepository } from "@/domain/repositories/court-repository";
import type { CourtReviewInput } from "@/lib/validation/court";

export class AddCourtReview {
  constructor(private readonly courtRepository: CourtRepository) {}

  async execute(courtId: string, userId: string, input: CourtReviewInput): Promise<void> {
    await this.courtRepository.upsertReview({
      courtId,
      userId,
      rating: input.rating,
      comment: input.comment || null,
    });
  }
}
