import type {
  FavoriteCourtSummary,
  PlayerProfile,
  PlayerRepository,
  UpdatePlayerProfileInput,
} from "@/domain/repositories/player-repository";
import { prisma } from "./client";

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  bio: true,
  phone: true,
  skillLevel: true,
  neighborhood: true,
  city: true,
  state: true,
  latitude: true,
  longitude: true,
} as const;

export class PrismaPlayerRepository implements PlayerRepository {
  async findById(id: string): Promise<PlayerProfile | null> {
    return prisma.user.findUnique({ where: { id }, select: PROFILE_SELECT });
  }

  async updateProfile(id: string, input: UpdatePlayerProfileInput): Promise<PlayerProfile> {
    return prisma.user.update({ where: { id }, data: input, select: PROFILE_SELECT });
  }

  async listFavoriteCourts(userId: string): Promise<FavoriteCourtSummary[]> {
    const favorites = await prisma.favoriteCourt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { court: { select: { id: true, name: true, neighborhood: true } } },
    });
    return favorites.map((favorite) => favorite.court);
  }
}
