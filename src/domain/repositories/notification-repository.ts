import type { NotificationType } from "@/generated/prisma/client";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationRepository {
  create(userId: string, type: NotificationType, payload: Record<string, unknown>): Promise<void>;
  createMany(
    userIds: string[],
    type: NotificationType,
    payload: Record<string, unknown>,
  ): Promise<void>;
  listForUser(userId: string): Promise<NotificationItem[]>;
  markRead(notificationId: string, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}
