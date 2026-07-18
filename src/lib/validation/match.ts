import { z } from "zod";
import { MatchVisibility, SkillLevel } from "@/generated/prisma/client";
import { SKILL_LEVEL_ORDER } from "@/lib/constants/skill-level-labels";

const DURATIONS_MINUTES = [60, 90, 120, 180] as const;

export const createMatchSchema = z
  .object({
    title: z.string().trim().min(3, "Dê um nome para a partida.").max(150),
    description: z.string().trim().max(1000).optional().or(z.literal("")),
    courtId: z.string().trim().optional().or(z.literal("")),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido."),
    durationMinutes: z.coerce
      .number()
      .int()
      .refine((value) => (DURATIONS_MINUTES as readonly number[]).includes(value), {
        message: "Duração inválida.",
      }),
    minSkillLevel: z.enum(SkillLevel).optional().or(z.literal("")),
    maxSkillLevel: z.enum(SkillLevel).optional().or(z.literal("")),
    maxPlayers: z.coerce
      .number()
      .int()
      .min(2, "Mínimo de 2 jogadores.")
      .max(40, "Máximo de 40 jogadores."),
    visibility: z.enum(MatchVisibility),
  })
  .refine(
    (data) => {
      if (!data.minSkillLevel || !data.maxSkillLevel) return true;
      return (
        SKILL_LEVEL_ORDER.indexOf(data.minSkillLevel) <=
        SKILL_LEVEL_ORDER.indexOf(data.maxSkillLevel)
      );
    },
    { message: "O nível mínimo não pode ser maior que o máximo.", path: ["maxSkillLevel"] },
  );

export type CreateMatchFormInput = z.infer<typeof createMatchSchema>;

export const inviteToMatchSchema = z.object({
  email: z.email("E-mail inválido."),
});
