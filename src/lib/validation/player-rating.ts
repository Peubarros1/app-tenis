import { z } from "zod";

export const ratePlayerSchema = z.object({
  ratedUserId: z.string().trim().min(1, "Selecione um jogador."),
  rating: z.coerce.number().int().min(1, "Escolha uma nota.").max(5, "Nota máxima é 5."),
  comment: z.string().trim().max(500).optional().or(z.literal("")),
});
