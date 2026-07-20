import { NotificationType } from "@/generated/prisma/enums";

export function describeNotification(
  type: NotificationType,
  payload: Record<string, unknown> | null,
): { text: string; href: string | null } {
  const p = payload ?? {};

  switch (type) {
    case NotificationType.FRIEND_REQUEST:
      return {
        text: `${String(p.fromUserName ?? "Um jogador")} te enviou um pedido de amizade.`,
        href: "/amigos",
      };
    case NotificationType.FRIEND_ACCEPTED:
      return {
        text: `${String(p.fromUserName ?? "Um jogador")} aceitou seu pedido de amizade.`,
        href: "/amigos",
      };
    case NotificationType.MATCH_INVITE:
      return {
        text: `Você foi convidado para a partida "${String(p.matchTitle ?? "")}".`,
        href: p.matchId ? `/partidas/${String(p.matchId)}` : "/partidas",
      };
    case NotificationType.MATCH_CANCELLED:
      return {
        text: `A partida "${String(p.matchTitle ?? "")}" foi cancelada.`,
        href: p.matchId ? `/partidas/${String(p.matchId)}` : "/partidas",
      };
    case NotificationType.MATCH_JOIN_REQUEST:
    case NotificationType.MATCH_UPDATE:
    case NotificationType.BOOKING_CONFIRMED:
    case NotificationType.BOOKING_CANCELLED:
    case NotificationType.NEW_REVIEW:
    case NotificationType.NEW_MESSAGE:
      return { text: "Você tem uma nova notificação.", href: null };
  }
}
