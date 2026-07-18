import type { MatchStatus } from "@/generated/prisma/client";

export interface RateablePlayer {
  userId: string;
  name: string | null;
  myRating: number | null;
  myComment: string | null;
}

export interface PlayerStats {
  matchesOrganized: number;
  matchesPlayed: number;
  averageRatingReceived: number | null;
  ratingsReceivedCount: number;
}

export interface MatchHistoryItem {
  matchId: string;
  title: string;
  scheduledAt: Date;
  status: MatchStatus;
  courtName: string | null;
  organizerName: string | null;
  isOrganizer: boolean;
}

export interface PlayerRatingRepository {
  /** Só retorna algo se a partida já terminou e o viewer foi participante confirmado. */
  listRateableParticipants(matchId: string, viewerUserId: string): Promise<RateablePlayer[]>;
  rate(
    matchId: string,
    raterId: string,
    ratedUserId: string,
    rating: number,
    comment: string | null,
  ): Promise<void>;
  getStats(userId: string): Promise<PlayerStats>;
  listMatchHistory(userId: string): Promise<MatchHistoryItem[]>;
}
