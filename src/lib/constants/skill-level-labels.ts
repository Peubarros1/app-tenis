import { SkillLevel } from "@/generated/prisma/enums";

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  [SkillLevel.INICIANTE]: "Iniciante",
  [SkillLevel.INTERMEDIARIO]: "Intermediário",
  [SkillLevel.AVANCADO]: "Avançado",
  [SkillLevel.COMPETITIVO]: "Competitivo",
};

/** Ordem crescente de nível, usada para comparar faixas (ex.: min/max de uma partida). */
export const SKILL_LEVEL_ORDER: SkillLevel[] = [
  SkillLevel.INICIANTE,
  SkillLevel.INTERMEDIARIO,
  SkillLevel.AVANCADO,
  SkillLevel.COMPETITIVO,
];
