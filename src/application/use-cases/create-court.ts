import { CourtType } from "@/generated/prisma/client";
import type { CourtRepository } from "@/domain/repositories/court-repository";
import type { CreateCourtInput, OpeningHourInput } from "@/lib/validation/court";

export class CreateCourt {
  constructor(private readonly courtRepository: CourtRepository) {}

  async execute(
    creatorId: string,
    input: CreateCourtInput,
    photoUrls: string[],
    openingHours: OpeningHourInput[],
  ): Promise<{ id: string }> {
    return this.courtRepository.create({
      name: input.name,
      description: input.description || null,
      courtType: input.courtType,
      bookingMode: input.bookingMode,
      surfaceType: input.surfaceType,
      isLighted: input.isLighted,
      isIndoor: input.isIndoor,
      address: input.address,
      neighborhood: input.neighborhood,
      latitude: input.latitude,
      longitude: input.longitude,
      hourlyPriceCents: input.hourlyPriceCents ?? null,
      officialBookingUrl: input.officialBookingUrl || null,
      bookingInstructions: input.bookingInstructions || null,
      phone: input.phone || null,
      ownerId: input.courtType === CourtType.PRIVATE ? creatorId : null,
      photoUrls,
      openingHours,
    });
  }
}
