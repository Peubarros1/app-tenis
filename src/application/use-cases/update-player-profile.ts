import type { PlayerProfile, PlayerRepository } from "@/domain/repositories/player-repository";
import type { UpdateProfileInput } from "@/lib/validation/profile";

export class UpdatePlayerProfile {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<PlayerProfile> {
    return this.playerRepository.updateProfile(userId, {
      name: input.name,
      bio: input.bio || null,
      phone: input.phone || null,
      image: input.image || null,
      skillLevel: input.skillLevel,
      neighborhood: input.neighborhood || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    });
  }
}
