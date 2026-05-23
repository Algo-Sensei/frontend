import {
  apiUrl,
  connectionError,
  extractMessageText,
  parseApiError,
  type MessageRecord,
} from "./client";
import type { OpenAIMessage } from "./chat";

// Guest/anonymous AI chat API
export type GuestReplyOptions = {
  content: string;
  history?: OpenAIMessage[];
};

type HistoryPayload = {
  role: "USER" | "AI";
  content: string;
};

function mapHistoryForAnonymous(history: OpenAIMessage[] = []): HistoryPayload[] {
  return history
    .filter((item) => item.role === "user" || item.role === "assistant")
    .map((item) => ({
      role: item.role === "assistant" ? "AI" : "USER",
      content: item.content,
    }));
}

export async function sendGuestReply({
  content,
  history,
}: GuestReplyOptions): Promise<{ reply: string }> {
  let res: Response;

  try {
    res = await fetch(apiUrl("/api/chat/anonymous/send"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        history: mapHistoryForAnonymous(history),
      }),
    });
  } catch {
    throw connectionError();
  }

  if (!res.ok) {
    throw await parseApiError(res, `API error ${res.status}`);
  }

  const rawBody = await res.text();

  if (!rawBody.trim()) {
    return { reply: "" };
  }

  try {
    const data = JSON.parse(rawBody) as MessageRecord;
    return { reply: extractMessageText(data) };
  } catch {
    return { reply: rawBody };
  }
}
