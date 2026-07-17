import { BookingStatus } from "@/generated/prisma/client";
import { BookingNotFoundError } from "@/domain/errors/booking-not-found-error";
import { OverlappingBookingError } from "@/domain/errors/overlapping-booking-error";
import type {
  BookingRepository,
  BookingSummary,
  CourtBookingSlot,
  CreateBookingInput,
} from "@/domain/repositories/booking-repository";
import { nowAsRecifeWallClock } from "@/lib/datetime";
import { prisma } from "./client";

const ACTIVE_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

export class PrismaBookingRepository implements BookingRepository {
  async create(input: CreateBookingInput): Promise<{ id: string }> {
    const overlapping = await prisma.booking.findFirst({
      where: {
        courtId: input.courtId,
        status: { in: ACTIVE_STATUSES },
        startTime: { lt: input.endTime },
        endTime: { gt: input.startTime },
      },
      select: { id: true },
    });
    if (overlapping) {
      throw new OverlappingBookingError();
    }

    try {
      return await prisma.booking.create({
        data: {
          courtId: input.courtId,
          userId: input.userId,
          startTime: input.startTime,
          endTime: input.endTime,
          notes: input.notes,
          status: BookingStatus.CONFIRMED,
        },
        select: { id: true },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Booking_no_overlap")) {
        throw new OverlappingBookingError();
      }
      throw error;
    }
  }

  async listUpcomingForCourt(courtId: string): Promise<CourtBookingSlot[]> {
    return prisma.booking.findMany({
      where: {
        courtId,
        status: { in: ACTIVE_STATUSES },
        endTime: { gt: nowAsRecifeWallClock() },
      },
      orderBy: { startTime: "asc" },
      select: { startTime: true, endTime: true, status: true },
    });
  }

  async listForUser(userId: string): Promise<BookingSummary[]> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        courtId: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        court: { select: { name: true } },
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      courtId: booking.courtId,
      courtName: booking.court.name,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
    }));
  }

  async cancel(bookingId: string, userId: string): Promise<void> {
    const result = await prisma.booking.updateMany({
      where: { id: bookingId, userId, status: { in: ACTIVE_STATUSES } },
      data: { status: BookingStatus.CANCELLED },
    });
    if (result.count === 0) {
      throw new BookingNotFoundError();
    }
  }
}
