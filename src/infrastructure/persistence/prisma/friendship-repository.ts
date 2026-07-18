import { FriendshipStatus } from "@/generated/prisma/client";
import { CannotFriendSelfError } from "@/domain/errors/cannot-friend-self-error";
import { FriendRequestAlreadyExistsError } from "@/domain/errors/friend-request-already-exists-error";
import { FriendRequestNotFoundError } from "@/domain/errors/friend-request-not-found-error";
import { UserNotFoundError } from "@/domain/errors/user-not-found-error";
import type {
  FriendRequestSummary,
  FriendSummary,
  FriendshipRepository,
} from "@/domain/repositories/friendship-repository";
import { prisma } from "./client";

export class PrismaFriendshipRepository implements FriendshipRepository {
  async sendRequest(requesterId: string, addresseeEmail: string): Promise<{ addresseeId: string }> {
    const addressee = await prisma.user.findUnique({
      where: { email: addresseeEmail },
      select: { id: true },
    });
    if (!addressee) throw new UserNotFoundError();
    if (addressee.id === requesterId) throw new CannotFriendSelfError();

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === FriendshipStatus.DECLINED) {
        // pedido recusado antes: permite tentar de novo, reabrindo como pendente
        await prisma.friendship.update({
          where: { id: existing.id },
          data: { requesterId, addresseeId: addressee.id, status: FriendshipStatus.PENDING },
        });
        return { addresseeId: addressee.id };
      }
      throw new FriendRequestAlreadyExistsError();
    }

    await prisma.friendship.create({
      data: { requesterId, addresseeId: addressee.id, status: FriendshipStatus.PENDING },
    });

    return { addresseeId: addressee.id };
  }

  async respond(
    friendshipId: string,
    userId: string,
    accept: boolean,
  ): Promise<{ requesterId: string }> {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (
      !friendship ||
      friendship.addresseeId !== userId ||
      friendship.status !== FriendshipStatus.PENDING
    ) {
      throw new FriendRequestNotFoundError();
    }

    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED },
    });

    return { requesterId: friendship.requesterId };
  }

  async remove(friendshipId: string, userId: string): Promise<void> {
    const result = await prisma.friendship.deleteMany({
      where: {
        id: friendshipId,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });
    if (result.count === 0) throw new FriendRequestNotFoundError();
  }

  async listFriends(userId: string): Promise<FriendSummary[]> {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: {
        id: true,
        requesterId: true,
        addresseeId: true,
        requester: { select: { id: true, name: true, email: true, skillLevel: true } },
        addressee: { select: { id: true, name: true, email: true, skillLevel: true } },
      },
    });

    return friendships.map((friendship) => {
      const friend =
        friendship.requesterId === userId ? friendship.addressee : friendship.requester;
      return {
        friendshipId: friendship.id,
        userId: friend.id,
        name: friend.name,
        email: friend.email,
        skillLevel: friend.skillLevel,
      };
    });
  }

  async listIncomingRequests(userId: string): Promise<FriendRequestSummary[]> {
    const requests = await prisma.friendship.findMany({
      where: { addresseeId: userId, status: FriendshipStatus.PENDING },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        requester: { select: { id: true, name: true, email: true } },
      },
    });

    return requests.map((request) => ({
      friendshipId: request.id,
      userId: request.requester.id,
      name: request.requester.name,
      email: request.requester.email,
      createdAt: request.createdAt,
    }));
  }

  async listOutgoingRequests(userId: string): Promise<FriendRequestSummary[]> {
    const requests = await prisma.friendship.findMany({
      where: { requesterId: userId, status: FriendshipStatus.PENDING },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        addressee: { select: { id: true, name: true, email: true } },
      },
    });

    return requests.map((request) => ({
      friendshipId: request.id,
      userId: request.addressee.id,
      name: request.addressee.name,
      email: request.addressee.email,
      createdAt: request.createdAt,
    }));
  }
}
