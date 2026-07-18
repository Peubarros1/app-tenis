import type { MatchRepository } from "@/domain/repositories/match-repository";
import type { CreateMatchFormInput } from "@/lib/validation/match";

export interface CreateMatchRequest extends Omit<CreateMatchFormInput, "date" | "startTime"> {
  scheduledAt: Date;
}

export class CreateMatch {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(organizerId: string, input: CreateMatchRequest): Promise<{ id: string }> {
    return this.matchRepository.create({
      organizerId,
      title: input.title,
      description: input.description || null,
      courtId: input.courtId || null,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      minSkillLevel: input.minSkillLevel || null,
      maxSkillLevel: input.maxSkillLevel || null,
      maxPlayers: input.maxPlayers,
      visibility: input.visibility,
    });
  }
}
