import { z } from "zod";
import { BookingMode, CourtType, SurfaceType } from "@/generated/prisma/enums";

export const createCourtSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome da quadra.").max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  courtType: z.enum(CourtType),
  bookingMode: z.enum(BookingMode),
  surfaceType: z.enum(SurfaceType),
  isLighted: z.boolean(),
  isIndoor: z.boolean(),
  address: z.string().trim().min(5, "Informe o endereço."),
  neighborhood: z.string().trim().min(1, "Selecione o bairro."),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  hourlyPriceCents: z.coerce.number().int().min(0).optional(),
  officialBookingUrl: z.url("URL inválida.").optional().or(z.literal("")),
  bookingInstructions: z.string().trim().max(500).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export type CreateCourtInput = z.infer<typeof createCourtSchema>;

export const openingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido."),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido."),
});

export type OpeningHourInput = z.infer<typeof openingHourSchema>;

export const courtSearchSchema = z.object({
  neighborhood: z.string().trim().optional().or(z.literal("")),
  surfaceType: z.enum(SurfaceType).optional().or(z.literal("")),
  lighted: z.literal("1").optional(),
  maxPriceCents: z.coerce.number().int().min(0).optional(),
});

export type CourtSearchInput = z.infer<typeof courtSearchSchema>;

export const courtReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Escolha uma nota.").max(5, "Nota máxima é 5."),
  comment: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CourtReviewInput = z.infer<typeof courtReviewSchema>;
