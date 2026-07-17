import type { BookingStatus } from "@/generated/prisma/client";

export interface BookingSummary {
  id: string;
  courtId: string;
  courtName: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  notes: string | null;
}

export interface CourtBookingSlot {
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
}

export interface CreateBookingInput {
  courtId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  notes: string | null;
}

export interface BookingRepository {
  create(input: CreateBookingInput): Promise<{ id: string }>;
  listUpcomingForCourt(courtId: string): Promise<CourtBookingSlot[]>;
  listForUser(userId: string): Promise<BookingSummary[]>;
  cancel(bookingId: string, userId: string): Promise<void>;
}
