import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Escreva uma mensagem.").max(1000, "Mensagem muito longa."),
});
