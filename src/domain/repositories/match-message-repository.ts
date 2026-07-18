export interface MatchMessageItem {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  userName: string | null;
}

export interface MatchMessageRepository {
  isConfirmedParticipant(matchId: string, userId: string): Promise<boolean>;
  listForMatch(matchId: string): Promise<MatchMessageItem[]>;
  send(matchId: string, userId: string, content: string): Promise<MatchMessageItem>;
}
