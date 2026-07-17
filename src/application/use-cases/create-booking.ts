import { BookingMode } from "@/generated/prisma/client";
import { BookingNotSupportedError } from "@/domain/errors/booking-not-supported-error";
import { PastBookingError } from "@/domain/errors/past-booking-error";
import type { BookingRepository } from "@/domain/repositories/booking-repository";
import type { CourtRepository } from "@/domain/repositories/court-repository";
import { nowAsRecifeWallClock } from "@/lib/datetime";

export interface CreateBookingRequest {
  startTime: Date;
  endTime: Date;
  notes: string | null;
}

export class CreateBooking {
  constructor(
    private readonly courtRepository: CourtRepository,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(
    courtId: string,
    userId: string,
    input: CreateBookingRequest,
  ): Promise<{ id: string }> {
    const court = await this.courtRepository.findById(courtId);
    if (!court || court.bookingMode !== BookingMode.INTERNAL) {
      throw new BookingNotSupportedError();
    }

    if (input.startTime <= nowAsRecifeWallClock()) {
      throw new PastBookingError();
    }

    return this.bookingRepository.create({
      courtId,
      userId,
      startTime: input.startTime,
      endTime: input.endTime,
      notes: input.notes,
    });
  }
}
