import { apiUrl } from "./client";

export type ChatHistoryItem = {
  id: string;
  title: string;
  date: string;
};

export type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type FetchReplyOptions = {
  apiKey: string;
  model: string;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
};

const DEFAULT_MAX_TOKENS = 512;
const DEFAULT_TEMPERATURE = 0.7;

// chat.ts
export async function fetchReply(
  history: OpenAIMessage[],
  _options: FetchReplyOptions
): Promise<string> {
  const lastMessage = history[history.length - 1];
  const userContent = lastMessage?.content ?? "";

  const res = await fetch(apiUrl("/api/chat/anonymous/send"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: userContent,
      history: history
        .slice(0, -1)
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role === "assistant" ? "AI" : "USER", content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content ?? "No response received.";
}

export async function fetchChatHistory(): Promise<ChatHistoryItem[]> {
  const res = await fetch(apiUrl("/api/chat/history"), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function clearChatHistory(): Promise<void> {
  await fetch(apiUrl("/api/chat/history"), { method: "DELETE", credentials: "include" });
}
