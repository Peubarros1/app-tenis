import type { SkillLevel } from "@/generated/prisma/client";

export interface FriendSummary {
  friendshipId: string;
  userId: string;
  name: string | null;
  email: string;
  skillLevel: SkillLevel;
}

export interface FriendRequestSummary {
  friendshipId: string;
  userId: string;
  name: string | null;
  email: string;
  createdAt: Date;
}

export interface FriendshipRepository {
  sendRequest(requesterId: string, addresseeEmail: string): Promise<{ addresseeId: string }>;
  respond(friendshipId: string, userId: string, accept: boolean): Promise<{ requesterId: string }>;
  remove(friendshipId: string, userId: string): Promise<void>;
  listFriends(userId: string): Promise<FriendSummary[]>;
  listIncomingRequests(userId: string): Promise<FriendRequestSummary[]>;
  listOutgoingRequests(userId: string): Promise<FriendRequestSummary[]>;
}
