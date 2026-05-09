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

export async function fetchReply(history: OpenAIMessage[], options: FetchReplyOptions): Promise<string> {
  const response = await fetch(apiUrl("/api/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "system", content: options.systemPrompt }, ...history],
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "No response received.";
}

export async function fetchChatHistory(): Promise<ChatHistoryItem[]> {
  const res = await fetch(apiUrl("/api/chat/history"), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function clearChatHistory(): Promise<void> {
  await fetch(apiUrl("/api/chat/history"), { method: "DELETE", credentials: "include" });
}
