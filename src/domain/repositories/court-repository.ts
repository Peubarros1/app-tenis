import type { BookingMode, CourtType, SurfaceType } from "@/generated/prisma/client";

export interface CourtSummary {
  id: string;
  name: string;
  neighborhood: string;
  courtType: CourtType;
  surfaceType: SurfaceType;
  isLighted: boolean;
  hourlyPriceCents: number | null;
  latitude: number;
  longitude: number;
  averageRating: number | null;
  reviewCount: number;
}

export interface CourtSearchFilters {
  neighborhood?: string;
  surfaceType?: SurfaceType;
  lightedOnly?: boolean;
  maxPriceCents?: number;
}

export interface CourtPhoto {
  id: string;
  url: string;
  position: number;
}

export interface CourtOpeningHour {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
}

export interface CourtReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  userId: string;
  userName: string | null;
}

export interface CourtDetail extends CourtSummary {
  description: string | null;
  bookingMode: BookingMode;
  isIndoor: boolean;
  address: string;
  city: string;
  state: string;
  currency: string;
  officialBookingUrl: string | null;
  bookingInstructions: string | null;
  phone: string | null;
  ownerId: string | null;
  photos: CourtPhoto[];
  openingHours: CourtOpeningHour[];
  reviews: CourtReviewItem[];
  isFavorited: boolean;
}

export interface CreateCourtInput {
  name: string;
  description: string | null;
  courtType: CourtType;
  bookingMode: BookingMode;
  surfaceType: SurfaceType;
  isLighted: boolean;
  isIndoor: boolean;
  address: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  hourlyPriceCents: number | null;
  officialBookingUrl: string | null;
  bookingInstructions: string | null;
  phone: string | null;
  ownerId: string | null;
  photoUrls: string[];
  openingHours: { dayOfWeek: number; opensAt: string; closesAt: string }[];
}

export interface UpsertCourtReviewInput {
  courtId: string;
  userId: string;
  rating: number;
  comment: string | null;
}

export interface CourtRepository {
  search(filters: CourtSearchFilters): Promise<CourtSummary[]>;
  findById(id: string, viewerUserId?: string): Promise<CourtDetail | null>;
  create(input: CreateCourtInput): Promise<{ id: string }>;
  upsertReview(input: UpsertCourtReviewInput): Promise<void>;
  toggleFavorite(courtId: string, userId: string): Promise<boolean>;
}
