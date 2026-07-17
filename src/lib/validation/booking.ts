import { z } from "zod";

const DURATIONS_MINUTES = [60, 90, 120] as const;

export const createBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido."),
  durationMinutes: z.coerce
    .number()
    .int()
    .refine((value) => (DURATIONS_MINUTES as readonly number[]).includes(value), {
      message: "Duração inválida.",
    }),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
