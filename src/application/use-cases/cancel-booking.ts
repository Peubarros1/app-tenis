import type { BookingRepository } from "@/domain/repositories/booking-repository";

export class CancelBooking {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(bookingId: string, userId: string): Promise<void> {
    await this.bookingRepository.cancel(bookingId, userId);
  }
}
