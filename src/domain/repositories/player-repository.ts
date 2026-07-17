import type { SkillLevel } from "@/generated/prisma/client";

export interface PlayerProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  phone: string | null;
  skillLevel: SkillLevel;
  neighborhood: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

export interface UpdatePlayerProfileInput {
  name: string;
  bio: string | null;
  phone: string | null;
  image: string | null;
  skillLevel: SkillLevel;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface FavoriteCourtSummary {
  id: string;
  name: string;
  neighborhood: string;
}

export interface PlayerRepository {
  findById(id: string): Promise<PlayerProfile | null>;
  updateProfile(id: string, input: UpdatePlayerProfileInput): Promise<PlayerProfile>;
  listFavoriteCourts(userId: string): Promise<FavoriteCourtSummary[]>;
}
