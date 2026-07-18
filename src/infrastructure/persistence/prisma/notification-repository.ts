import type { NotificationType, Prisma } from "@/generated/prisma/client";
import type {
  NotificationItem,
  NotificationRepository,
} from "@/domain/repositories/notification-repository";
import { prisma } from "./client";

export class PrismaNotificationRepository implements NotificationRepository {
  async create(
    userId: string,
    type: NotificationType,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await prisma.notification.create({
      data: { userId, type, payload: payload as Prisma.InputJsonValue },
    });
  }

  async createMany(
    userIds: string[],
    type: NotificationType,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (userIds.length === 0) return;
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type, payload: payload as Prisma.InputJsonValue })),
    });
  }

  async listForUser(userId: string): Promise<NotificationItem[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      payload: notification.payload as Record<string, unknown> | null,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    }));
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, readAt: null } });
  }
}
