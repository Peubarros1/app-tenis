import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  email: z.email("E-mail inválido."),
});
