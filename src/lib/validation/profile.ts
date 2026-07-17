import { z } from "zod";
import { SkillLevel } from "@/generated/prisma/client";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo.").max(100),
  bio: z
    .string()
    .trim()
    .max(280, "A bio deve ter no máximo 280 caracteres.")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(20, "Telefone inválido.").optional().or(z.literal("")),
  image: z.url("URL de imagem inválida.").optional().or(z.literal("")),
  skillLevel: z.enum(SkillLevel),
  neighborhood: z.string().trim().max(100).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
