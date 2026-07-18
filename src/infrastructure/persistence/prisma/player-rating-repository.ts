import { MatchStatus, ParticipantStatus } from "@/generated/prisma/client";
import { MatchNotEndedError } from "@/domain/errors/match-not-ended-error";
import { MatchNotFoundError } from "@/domain/errors/match-not-found-error";
import { NotAParticipantError } from "@/domain/errors/not-a-participant-error";
import { PlayerNotRateableError } from "@/domain/errors/player-not-rateable-error";
import type {
  MatchHistoryItem,
  PlayerRatingRepository,
  PlayerStats,
  RateablePlayer,
} from "@/domain/repositories/player-rating-repository";
import { nowAsRecifeWallClock } from "@/lib/datetime";
import { prisma } from "./client";

async function assertMatchEnded(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { scheduledAt: true, durationMinutes: true, status: true },
  });
  if (!match) throw new MatchNotFoundError();

  const endsAt = new Date(match.scheduledAt.getTime() + match.durationMinutes * 60_000);
  if (match.status === MatchStatus.CANCELLED || endsAt > nowAsRecifeWallClock()) {
    throw new MatchNotEndedError();
  }

  return match;
}

export class PrismaPlayerRatingRepository implements PlayerRatingRepository {
  async listRateableParticipants(matchId: string, viewerUserId: string): Promise<RateablePlayer[]> {
    await assertMatchEnded(matchId);

    const viewerParticipation = await prisma.matchParticipant.findUnique({
      where: { matchId_userId: { matchId, userId: viewerUserId } },
      select: { status: true },
    });
    if (viewerParticipation?.status !== ParticipantStatus.CONFIRMED) {
      throw new NotAParticipantError();
    }

    const [participants, myRatings] = await Promise.all([
      prisma.matchParticipant.findMany({
        where: { matchId, status: ParticipantStatus.CONFIRMED, userId: { not: viewerUserId } },
        select: { user: { select: { id: true, name: true } } },
      }),
      prisma.playerRating.findMany({
        where: { matchId, raterId: viewerUserId },
        select: { ratedUserId: true, rating: true, comment: true },
      }),
    ]);

    const ratingsByUserId = new Map(myRatings.map((rating) => [rating.ratedUserId, rating]));

    return participants.map(({ user }) => ({
      userId: user.id,
      name: user.name,
      myRating: ratingsByUserId.get(user.id)?.rating ?? null,
      myComment: ratingsByUserId.get(user.id)?.comment ?? null,
    }));
  }

  async rate(
    matchId: string,
    raterId: string,
    ratedUserId: string,
    rating: number,
    comment: string | null,
  ): Promise<void> {
    await assertMatchEnded(matchId);

    if (raterId === ratedUserId) throw new PlayerNotRateableError();

    const [raterParticipation, ratedParticipation] = await Promise.all([
      prisma.matchParticipant.findUnique({
        where: { matchId_userId: { matchId, userId: raterId } },
        select: { status: true },
      }),
      prisma.matchParticipant.findUnique({
        where: { matchId_userId: { matchId, userId: ratedUserId } },
        select: { status: true },
      }),
    ]);

    if (raterParticipation?.status !== ParticipantStatus.CONFIRMED) {
      throw new NotAParticipantError();
    }
    if (ratedParticipation?.status !== ParticipantStatus.CONFIRMED) {
      throw new PlayerNotRateableError();
    }

    await prisma.playerRating.upsert({
      where: { matchId_raterId_ratedUserId: { matchId, raterId, ratedUserId } },
      create: { matchId, raterId, ratedUserId, rating, comment },
      update: { rating, comment },
    });
  }

  async getStats(userId: string): Promise<PlayerStats> {
    const now = nowAsRecifeWallClock();

    const [matchesOrganized, matchesPlayed, ratingAggregate] = await Promise.all([
      prisma.match.count({ where: { organizerId: userId } }),
      prisma.matchParticipant.count({
        where: {
          userId,
          status: ParticipantStatus.CONFIRMED,
          match: { scheduledAt: { lt: now }, status: { not: MatchStatus.CANCELLED } },
        },
      }),
      prisma.playerRating.aggregate({
        where: { ratedUserId: userId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      matchesOrganized,
      matchesPlayed,
      averageRatingReceived: ratingAggregate._avg.rating,
      ratingsReceivedCount: ratingAggregate._count.rating,
    };
  }

  async listMatchHistory(userId: string): Promise<MatchHistoryItem[]> {
    const now = nowAsRecifeWallClock();

    const matches = await prisma.match.findMany({
      where: {
        scheduledAt: { lt: now },
        OR: [
          { organizerId: userId },
          { participants: { some: { userId, status: ParticipantStatus.CONFIRMED } } },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        status: true,
        organizerId: true,
        organizer: { select: { name: true } },
        court: { select: { name: true } },
      },
    });

    return matches.map((match) => ({
      matchId: match.id,
      title: match.title,
      scheduledAt: match.scheduledAt,
      status: match.status,
      courtName: match.court?.name ?? null,
      organizerName: match.organizer.name,
      isOrganizer: match.organizerId === userId,
    }));
  }
}
