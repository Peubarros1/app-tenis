import type { Prisma } from "@/generated/prisma/client";
import type {
  CourtDetail,
  CourtRepository,
  CourtSearchFilters,
  CourtSummary,
  CreateCourtInput,
  UpsertCourtReviewInput,
} from "@/domain/repositories/court-repository";
import { prisma } from "./client";

function average(ratings: number[]): number | null {
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

function summarySelect(viewerUserId?: string) {
  return {
    id: true,
    name: true,
    neighborhood: true,
    courtType: true,
    surfaceType: true,
    isLighted: true,
    hourlyPriceCents: true,
    latitude: true,
    longitude: true,
    reviews: { select: { rating: true } },
    photos: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    ...(viewerUserId
      ? { favoritedBy: { where: { userId: viewerUserId }, select: { userId: true } } }
      : {}),
  } satisfies Prisma.CourtSelect;
}

type SummaryRow = {
  id: string;
  name: string;
  neighborhood: string;
  courtType: CourtSummary["courtType"];
  surfaceType: CourtSummary["surfaceType"];
  isLighted: boolean;
  hourlyPriceCents: number | null;
  latitude: number;
  longitude: number;
  reviews: { rating: number }[];
  photos: { url: string }[];
  favoritedBy?: { userId: string }[];
};

function toSummary(court: SummaryRow): CourtSummary {
  return {
    id: court.id,
    name: court.name,
    neighborhood: court.neighborhood,
    courtType: court.courtType,
    surfaceType: court.surfaceType,
    isLighted: court.isLighted,
    hourlyPriceCents: court.hourlyPriceCents,
    latitude: court.latitude,
    longitude: court.longitude,
    averageRating: average(court.reviews.map((review) => review.rating)),
    reviewCount: court.reviews.length,
    coverPhotoUrl: court.photos[0]?.url ?? null,
    isFavorited: (court.favoritedBy?.length ?? 0) > 0,
  };
}

export class PrismaCourtRepository implements CourtRepository {
  async search(filters: CourtSearchFilters, viewerUserId?: string): Promise<CourtSummary[]> {
    const where: Prisma.CourtWhereInput = {
      ...(filters.query
        ? {
            OR: [
              { name: { contains: filters.query, mode: "insensitive" } },
              { neighborhood: { contains: filters.query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.neighborhood ? { neighborhood: filters.neighborhood } : {}),
      ...(filters.courtType?.length ? { courtType: { in: filters.courtType } } : {}),
      ...(filters.surfaceType ? { surfaceType: filters.surfaceType } : {}),
      ...(filters.lightedOnly ? { isLighted: true } : {}),
      ...(filters.maxPriceCents !== undefined
        ? { hourlyPriceCents: { lte: filters.maxPriceCents } }
        : {}),
    };

    const courts = await prisma.court.findMany({
      where,
      select: summarySelect(viewerUserId),
      orderBy: { createdAt: "desc" },
    });

    return courts.map(toSummary);
  }

  async findById(id: string, viewerUserId?: string): Promise<CourtDetail | null> {
    const court = await prisma.court.findUnique({
      where: { id },
      select: {
        ...summarySelect(viewerUserId),
        description: true,
        bookingMode: true,
        isIndoor: true,
        address: true,
        city: true,
        state: true,
        currency: true,
        officialBookingUrl: true,
        bookingInstructions: true,
        phone: true,
        ownerId: true,
        photos: { orderBy: { position: "asc" }, select: { id: true, url: true, position: true } },
        openingHours: {
          orderBy: { dayOfWeek: "asc" },
          select: { dayOfWeek: true, opensAt: true, closesAt: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            userId: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!court) return null;

    return {
      ...toSummary(court),
      description: court.description,
      bookingMode: court.bookingMode,
      isIndoor: court.isIndoor,
      address: court.address,
      city: court.city,
      state: court.state,
      currency: court.currency,
      officialBookingUrl: court.officialBookingUrl,
      bookingInstructions: court.bookingInstructions,
      phone: court.phone,
      ownerId: court.ownerId,
      photos: court.photos,
      openingHours: court.openingHours,
      reviews: court.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        userId: review.userId,
        userName: review.user.name,
      })),
    };
  }

  async create(input: CreateCourtInput): Promise<{ id: string }> {
    const court = await prisma.court.create({
      data: {
        name: input.name,
        description: input.description,
        courtType: input.courtType,
        bookingMode: input.bookingMode,
        surfaceType: input.surfaceType,
        isLighted: input.isLighted,
        isIndoor: input.isIndoor,
        address: input.address,
        neighborhood: input.neighborhood,
        latitude: input.latitude,
        longitude: input.longitude,
        hourlyPriceCents: input.hourlyPriceCents,
        officialBookingUrl: input.officialBookingUrl,
        bookingInstructions: input.bookingInstructions,
        phone: input.phone,
        ownerId: input.ownerId,
        photos: {
          create: input.photoUrls.map((url, index) => ({ url, position: index })),
        },
        openingHours: {
          create: input.openingHours,
        },
      },
      select: { id: true },
    });

    return court;
  }

  async upsertReview(input: UpsertCourtReviewInput): Promise<void> {
    await prisma.courtReview.upsert({
      where: { courtId_userId: { courtId: input.courtId, userId: input.userId } },
      create: {
        courtId: input.courtId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment,
      },
      update: { rating: input.rating, comment: input.comment },
    });
  }

  async toggleFavorite(courtId: string, userId: string): Promise<boolean> {
    const existing = await prisma.favoriteCourt.findUnique({
      where: { userId_courtId: { userId, courtId } },
    });

    if (existing) {
      await prisma.favoriteCourt.delete({ where: { userId_courtId: { userId, courtId } } });
      return false;
    }

    await prisma.favoriteCourt.create({ data: { userId, courtId } });
    return true;
  }
}
