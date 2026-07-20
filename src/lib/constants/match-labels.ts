import { MatchStatus, MatchVisibility, ParticipantStatus } from "@/generated/prisma/enums";

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.OPEN]: "Aberta",
  [MatchStatus.FULL]: "Lotada",
  [MatchStatus.CANCELLED]: "Cancelada",
  [MatchStatus.COMPLETED]: "Concluída",
};

export const MATCH_VISIBILITY_LABELS: Record<MatchVisibility, string> = {
  [MatchVisibility.PUBLIC]: "Pública (qualquer jogador pode entrar)",
  [MatchVisibility.FRIENDS_ONLY]: "Só para seus amigos (e quem você convidar)",
  [MatchVisibility.PRIVATE]: "Privada (só quem for convidado)",
};

export const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
  [ParticipantStatus.INVITED]: "Convidado",
  [ParticipantStatus.CONFIRMED]: "Confirmado",
  [ParticipantStatus.WAITLIST]: "Fila de espera",
  [ParticipantStatus.DECLINED]: "Recusou",
  [ParticipantStatus.LEFT]: "Saiu",
};
