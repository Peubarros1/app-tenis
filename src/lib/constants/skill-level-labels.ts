import { SkillLevel } from "@/generated/prisma/client";

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  [SkillLevel.INICIANTE]: "Iniciante",
  [SkillLevel.INTERMEDIARIO]: "Intermediário",
  [SkillLevel.AVANCADO]: "Avançado",
  [SkillLevel.COMPETITIVO]: "Competitivo",
};
