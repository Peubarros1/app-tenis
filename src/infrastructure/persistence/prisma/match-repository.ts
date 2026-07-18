import {
  FriendshipStatus,
  MatchStatus,
  MatchVisibility,
  ParticipantStatus,
  type Prisma,
  type SkillLevel,
} from "@/generated/prisma/client";
import { AlreadyParticipantError } from "@/domain/errors/already-participant-error";
import { ForbiddenMatchActionError } from "@/domain/errors/forbidden-match-action-error";
import { MatchNotFoundError } from "@/domain/errors/match-not-found-error";
import { MatchNotOpenError } from "@/domain/errors/match-not-open-error";
import { NotAParticipantError } from "@/domain/errors/not-a-participant-error";
import { UserNotFoundError } from "@/domain/errors/user-not-found-error";
import type {
  CreateMatchInput,
  MatchDetail,
  MatchRepository,
  MatchSearchFilters,
  MatchSummary,
} from "@/domain/repositories/match-repository";
import { nowAsRecifeWallClock } from "@/lib/datetime";
import { prisma } from "./client";

const ACTIVE_PARTICIPANT_STATUSES: ParticipantStatus[] = [
  ParticipantStatus.CONFIRMED,
  ParticipantStatus.WAITLIST,
  ParticipantStatus.INVITED,
];

const MATCH_SUMMARY_SELECT = {
  id: true,
  title: true,
  scheduledAt: true,
  durationMinutes: true,
  maxPlayers: true,
  status: true,
  visibility: true,
  minSkillLevel: true,
  maxSkillLevel: true,
  organizerId: true,
  organizer: { select: { name: true } },
  courtId: true,
  court: { select: { name: true, neighborhood: true } },
  _count: { select: { participants: { where: { status: ParticipantStatus.CONFIRMED } } } },
} satisfies Prisma.MatchSelect;

type MatchSummaryRow = {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  maxPlayers: number;
  status: MatchStatus;
  visibility: MatchVisibility;
  minSkillLevel: SkillLevel | null;
  maxSkillLevel: SkillLevel | null;
  organizerId: string;
  organizer: { name: string | null };
  courtId: string | null;
  court: { name: string; neighborhood: string } | null;
  _count: { participants: number };
};

function toSummary(match: MatchSummaryRow): MatchSummary {
  return {
    id: match.id,
    title: match.title,
    scheduledAt: match.scheduledAt,
    durationMinutes: match.durationMinutes,
    maxPlayers: match.maxPlayers,
    confirmedCount: match._count.participants,
    status: match.status,
    visibility: match.visibility,
    minSkillLevel: match.minSkillLevel,
    maxSkillLevel: match.maxSkillLevel,
    courtId: match.courtId,
    courtName: match.court?.name ?? null,
    courtNeighborhood: match.court?.neighborhood ?? null,
    organizerId: match.organizerId,
    organizerName: match.organizer.name,
  };
}

export class PrismaMatchRepository implements MatchRepository {
  async create(input: CreateMatchInput): Promise<{ id: string }> {
    return prisma.match.create({
      data: {
        organizerId: input.organizerId,
        title: input.title,
        description: input.description,
        courtId: input.courtId,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        minSkillLevel: input.minSkillLevel,
        maxSkillLevel: input.maxSkillLevel,
        maxPlayers: input.maxPlayers,
        visibility: input.visibility,
        participants: {
          create: { userId: input.organizerId, status: ParticipantStatus.CONFIRMED },
        },
      },
      select: { id: true },
    });
  }

  async search(filters: MatchSearchFilters, viewerUserId?: string): Promise<MatchSummary[]> {
    const matches = await prisma.match.findMany({
      where: {
        status: { in: [MatchStatus.OPEN, MatchStatus.FULL] },
        scheduledAt: { gt: nowAsRecifeWallClock() },
        OR: [
          { visibility: MatchVisibility.PUBLIC },
          ...(viewerUserId
            ? [
                {
                  visibility: MatchVisibility.FRIENDS_ONLY,
                  organizer: {
                    OR: [
                      {
                        friendshipsSent: {
                          some: { addresseeId: viewerUserId, status: FriendshipStatus.ACCEPTED },
                        },
                      },
                      {
                        friendshipsReceived: {
                          some: { requesterId: viewerUserId, status: FriendshipStatus.ACCEPTED },
                        },
                      },
                    ],
                  },
                },
              ]
            : []),
        ],
        ...(filters.neighborhood ? { court: { neighborhood: filters.neighborhood } } : {}),
      },
      orderBy: { scheduledAt: "asc" },
      select: MATCH_SUMMARY_SELECT,
    });

    return matches.map(toSummary);
  }

  async findById(id: string, viewerUserId?: string): Promise<MatchDetail | null> {
    const match = await prisma.match.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        durationMinutes: true,
        maxPlayers: true,
        status: true,
        visibility: true,
        minSkillLevel: true,
        maxSkillLevel: true,
        organizerId: true,
        organizer: { select: { name: true } },
        courtId: true,
        court: { select: { name: true, neighborhood: true } },
        participants: {
          orderBy: { joinedAt: "asc" },
          select: {
            userId: true,
            status: true,
            joinedAt: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!match) return null;

    const confirmedCount = match.participants.filter(
      (participant) => participant.status === ParticipantStatus.CONFIRMED,
    ).length;
    const viewerParticipant = viewerUserId
      ? match.participants.find((participant) => participant.userId === viewerUserId)
      : undefined;

    return {
      id: match.id,
      title: match.title,
      description: match.description,
      scheduledAt: match.scheduledAt,
      durationMinutes: match.durationMinutes,
      maxPlayers: match.maxPlayers,
      confirmedCount,
      status: match.status,
      visibility: match.visibility,
      minSkillLevel: match.minSkillLevel,
      maxSkillLevel: match.maxSkillLevel,
      courtId: match.courtId,
      courtName: match.court?.name ?? null,
      courtNeighborhood: match.court?.neighborhood ?? null,
      organizerId: match.organizerId,
      organizerName: match.organizer.name,
      participants: match.participants
        .filter(
          (participant) =>
            participant.status !== ParticipantStatus.DECLINED &&
            participant.status !== ParticipantStatus.LEFT,
        )
        .map((participant) => ({
          userId: participant.userId,
          userName: participant.user.name,
          userEmail: participant.user.email,
          status: participant.status,
          joinedAt: participant.joinedAt,
        })),
      viewerParticipantStatus: viewerParticipant?.status ?? null,
    };
  }

  async join(matchId: string, userId: string): Promise<ParticipantStatus> {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        select: { status: true, maxPlayers: true },
      });
      if (!match) throw new MatchNotFoundError();
      if (match.status === MatchStatus.CANCELLED || match.status === MatchStatus.COMPLETED) {
        throw new MatchNotOpenError();
      }

      const existing = await tx.matchParticipant.findUnique({
        where: { matchId_userId: { matchId, userId } },
      });
      if (existing && ACTIVE_PARTICIPANT_STATUSES.includes(existing.status)) {
        throw new AlreadyParticipantError();
      }

      const confirmedCount = await tx.matchParticipant.count({
        where: { matchId, status: ParticipantStatus.CONFIRMED },
      });
      const newStatus =
        confirmedCount < match.maxPlayers
          ? ParticipantStatus.CONFIRMED
          : ParticipantStatus.WAITLIST;

      if (existing) {
        await tx.matchParticipant.update({
          where: { matchId_userId: { matchId, userId } },
          data: { status: newStatus, joinedAt: new Date() },
        });
      } else {
        await tx.matchParticipant.create({ data: { matchId, userId, status: newStatus } });
      }

      if (newStatus === ParticipantStatus.CONFIRMED && confirmedCount + 1 >= match.maxPlayers) {
        await tx.match.update({ where: { id: matchId }, data: { status: MatchStatus.FULL } });
      }

      return newStatus;
    });
  }

  async invite(
    matchId: string,
    organizerId: string,
    inviteeEmail: string,
  ): Promise<{ inviteeId: string; matchTitle: string }> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { organizerId: true, status: true, title: true },
    });
    if (!match) throw new MatchNotFoundError();
    if (match.organizerId !== organizerId) throw new ForbiddenMatchActionError();
    if (match.status === MatchStatus.CANCELLED || match.status === MatchStatus.COMPLETED) {
      throw new MatchNotOpenError();
    }

    const invitee = await prisma.user.findUnique({
      where: { email: inviteeEmail },
      select: { id: true },
    });
    if (!invitee) throw new UserNotFoundError();

    const existing = await prisma.matchParticipant.findUnique({
      where: { matchId_userId: { matchId, userId: invitee.id } },
    });
    if (existing && ACTIVE_PARTICIPANT_STATUSES.includes(existing.status)) {
      throw new AlreadyParticipantError();
    }

    if (existing) {
      await prisma.matchParticipant.update({
        where: { matchId_userId: { matchId, userId: invitee.id } },
        data: { status: ParticipantStatus.INVITED, joinedAt: new Date() },
      });
    } else {
      await prisma.matchParticipant.create({
        data: { matchId, userId: invitee.id, status: ParticipantStatus.INVITED },
      });
    }

    return { inviteeId: invitee.id, matchTitle: match.title };
  }

  async respondToInvite(matchId: string, userId: string, accept: boolean): Promise<void> {
    return prisma.$transaction(async (tx) => {
      const participant = await tx.matchParticipant.findUnique({
        where: { matchId_userId: { matchId, userId } },
      });
      if (!participant || participant.status !== ParticipantStatus.INVITED) {
        throw new NotAParticipantError();
      }

      if (!accept) {
        await tx.matchParticipant.update({
          where: { matchId_userId: { matchId, userId } },
          data: { status: ParticipantStatus.DECLINED },
        });
        return;
      }

      const match = await tx.match.findUnique({
        where: { id: matchId },
        select: { status: true, maxPlayers: true },
      });
      if (
        !match ||
        match.status === MatchStatus.CANCELLED ||
        match.status === MatchStatus.COMPLETED
      ) {
        throw new MatchNotOpenError();
      }

      const confirmedCount = await tx.matchParticipant.count({
        where: { matchId, status: ParticipantStatus.CONFIRMED },
      });
      const newStatus =
        confirmedCount < match.maxPlayers
          ? ParticipantStatus.CONFIRMED
          : ParticipantStatus.WAITLIST;

      await tx.matchParticipant.update({
        where: { matchId_userId: { matchId, userId } },
        data: { status: newStatus },
      });

      if (newStatus === ParticipantStatus.CONFIRMED && confirmedCount + 1 >= match.maxPlayers) {
        await tx.match.update({ where: { id: matchId }, data: { status: MatchStatus.FULL } });
      }
    });
  }

  async leave(matchId: string, userId: string): Promise<void> {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        select: { organizerId: true, status: true, maxPlayers: true },
      });
      if (!match) throw new MatchNotFoundError();
      if (match.organizerId === userId) {
        throw new ForbiddenMatchActionError(
          "O organizador não pode sair da partida — cancele-a em vez disso.",
        );
      }

      const participant = await tx.matchParticipant.findUnique({
        where: { matchId_userId: { matchId, userId } },
      });
      if (!participant || !ACTIVE_PARTICIPANT_STATUSES.includes(participant.status)) {
        throw new NotAParticipantError();
      }

      const wasConfirmed = participant.status === ParticipantStatus.CONFIRMED;

      await tx.matchParticipant.update({
        where: { matchId_userId: { matchId, userId } },
        data: { status: ParticipantStatus.LEFT },
      });

      if (wasConfirmed) {
        const nextInLine = await tx.matchParticipant.findFirst({
          where: { matchId, status: ParticipantStatus.WAITLIST },
          orderBy: { joinedAt: "asc" },
        });

        if (nextInLine) {
          await tx.matchParticipant.update({
            where: { id: nextInLine.id },
            data: { status: ParticipantStatus.CONFIRMED },
          });
        } else if (match.status === MatchStatus.FULL) {
          await tx.match.update({ where: { id: matchId }, data: { status: MatchStatus.OPEN } });
        }
      }
    });
  }

  async cancel(
    matchId: string,
    organizerId: string,
  ): Promise<{ notifiedUserIds: string[]; matchTitle: string }> {
    const [affectedParticipants, matchBeforeCancel] = await Promise.all([
      prisma.matchParticipant.findMany({
        where: {
          matchId,
          userId: { not: organizerId },
          status: { in: ACTIVE_PARTICIPANT_STATUSES },
        },
        select: { userId: true },
      }),
      prisma.match.findUnique({
        where: { id: matchId },
        select: { title: true, organizerId: true },
      }),
    ]);

    const result = await prisma.match.updateMany({
      where: { id: matchId, organizerId, status: { in: [MatchStatus.OPEN, MatchStatus.FULL] } },
      data: { status: MatchStatus.CANCELLED },
    });

    if (result.count === 0) {
      if (!matchBeforeCancel) throw new MatchNotFoundError();
      if (matchBeforeCancel.organizerId !== organizerId) throw new ForbiddenMatchActionError();
      throw new MatchNotOpenError();
    }

    return {
      notifiedUserIds: affectedParticipants.map((participant) => participant.userId),
      matchTitle: matchBeforeCancel!.title,
    };
  }

  async listInvitesForUser(userId: string): Promise<MatchSummary[]> {
    const matches = await prisma.match.findMany({
      where: { participants: { some: { userId, status: ParticipantStatus.INVITED } } },
      orderBy: { scheduledAt: "asc" },
      select: MATCH_SUMMARY_SELECT,
    });

    return matches.map(toSummary);
  }
}
