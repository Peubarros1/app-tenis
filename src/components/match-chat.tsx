"use client";

import { useEffect, useRef, useState } from "react";
import { formatRecifeTime } from "@/lib/datetime";
import {
  getMatchMessagesAction,
  sendMatchMessageAction,
  type ChatMessageDTO,
} from "@/app/partidas/[id]/chat-actions";

const POLL_INTERVAL_MS = 3000;

export function MatchChat({ matchId, currentUserId }: { matchId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const latest = await getMatchMessagesAction(matchId);
      if (!cancelled) setMessages(latest);
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [matchId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content) return;

    setSending(true);
    setError(null);
    const result = await sendMatchMessageAction(matchId, content);
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setInput("");
    const latest = await getMatchMessagesAction(matchId);
    setMessages(latest);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Chat da partida
      </h2>

      <ul ref={listRef} className="flex max-h-72 flex-col gap-2 overflow-y-auto text-sm">
        {messages.length === 0 ? (
          <li className="text-zinc-500 dark:text-zinc-400">
            Nenhuma mensagem ainda. Diga oi para o grupo!
          </li>
        ) : (
          messages.map((message) => (
            <li key={message.id} className="flex flex-col">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {message.userId === currentUserId ? "Você" : (message.userName ?? "Jogador")} ·{" "}
                {formatRecifeTime(new Date(message.createdAt))}
              </span>
              <span className="text-zinc-950 dark:text-zinc-50">{message.content}</span>
            </li>
          ))
        )}
      </ul>

      {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escreva uma mensagem…"
          maxLength={1000}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={sending || input.trim().length === 0}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
