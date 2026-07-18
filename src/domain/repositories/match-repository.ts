import type {
  MatchStatus,
  MatchVisibility,
  ParticipantStatus,
  SkillLevel,
} from "@/generated/prisma/client";

export interface MatchParticipantSummary {
  userId: string;
  userName: string | null;
  userEmail: string;
  status: ParticipantStatus;
  joinedAt: Date;
}

export interface MatchSummary {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  maxPlayers: number;
  confirmedCount: number;
  status: MatchStatus;
  visibility: MatchVisibility;
  minSkillLevel: SkillLevel | null;
  maxSkillLevel: SkillLevel | null;
  courtId: string | null;
  courtName: string | null;
  courtNeighborhood: string | null;
  organizerId: string;
  organizerName: string | null;
}

export interface MatchDetail extends MatchSummary {
  description: string | null;
  participants: MatchParticipantSummary[];
  viewerParticipantStatus: ParticipantStatus | null;
}

export interface MatchSearchFilters {
  neighborhood?: string;
}

export interface CreateMatchInput {
  organizerId: string;
  title: string;
  description: string | null;
  courtId: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  minSkillLevel: SkillLevel | null;
  maxSkillLevel: SkillLevel | null;
  maxPlayers: number;
  visibility: MatchVisibility;
}

export interface MatchRepository {
  create(input: CreateMatchInput): Promise<{ id: string }>;
  search(filters: MatchSearchFilters): Promise<MatchSummary[]>;
  findById(id: string, viewerUserId?: string): Promise<MatchDetail | null>;
  /** Torna o usuário participante (CONFIRMED se houver vaga, senão WAITLIST). Retorna o status final. */
  join(matchId: string, userId: string): Promise<ParticipantStatus>;
  /** Convida um jogador (por e-mail) para a partida; cria participação com status INVITED. */
  invite(matchId: string, organizerId: string, inviteeEmail: string): Promise<void>;
  /** Aceita ou recusa um convite pendente (INVITED). */
  respondToInvite(matchId: string, userId: string, accept: boolean): Promise<void>;
  /** Sai da partida (participação ativa -> LEFT), promovendo o primeiro da fila de espera se houver vaga. */
  leave(matchId: string, userId: string): Promise<void>;
  /** Cancela a partida inteira (só o organizador). */
  cancel(matchId: string, organizerId: string): Promise<void>;
  /** Partidas em que o usuário tem um convite pendente (status INVITED). */
  listInvitesForUser(userId: string): Promise<MatchSummary[]>;
}
