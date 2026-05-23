import {
  apiUrl,
  connectionError,
  extractMessageText,
  parseApiError,
  type MessageRecord,
} from "./client";

// Authenticated AI chat API
export type ChatHistoryItem = {
  id: string;
  title: string;
  date: string;
};

export type AuthenticatedReplyOptions = {
  chatId?: string | null;
  content: string;
  file?: File | null;
  chatTitle?: string;
};

export type ChatMessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
};

type ChatRecord = {
  chatId?: number | string;
  chatID?: number | string;
  id?: number | string;
  chatTitle?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ChatHistoryResponse =
  | ChatRecord[]
  | {
      chats?: ChatRecord[];
      items?: ChatRecord[];
      data?: ChatRecord[];
      content?: ChatRecord[];
      history?: ChatRecord[];
      records?: ChatRecord[];
    };

function getChatId(chat: ChatRecord): string {
  return String(chat.chatId ?? chat.chatID ?? chat.id ?? "");
}

function getChatTitle(chat: ChatRecord): string {
  return String(chat.chatTitle ?? chat.title ?? "New chat");
}

function getChatDateSource(chat: ChatRecord): string | null {
  const value = chat.updatedAt ?? chat.createdAt;
  return typeof value === "string" && value ? value : null;
}

function groupDate(value: string | null): string {
  if (!value) return "This week";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "This week";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = startOfToday.getTime() - startOfTarget.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return "Older";
}

function extractChatRecords(payload: ChatHistoryResponse): ChatRecord[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.chats)) return payload.chats;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.history)) return payload.history;
  if (Array.isArray(payload.records)) return payload.records;
  return [];
}

async function fetchChatHistoryRecords(): Promise<ChatRecord[]> {
  const endpoints = ["/api/chat", "/api/chat/history"];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    let res: Response;

    try {
      res = await fetch(apiUrl(endpoint), {
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      lastError = connectionError();
      continue;
    }

    if (!res.ok) {
      lastError = await parseApiError(res, "Failed to fetch history");
      continue;
    }

    const payload = (await res.json()) as ChatHistoryResponse;
    return extractChatRecords(payload);
  }

  throw lastError ?? new Error("Failed to fetch history");
}

export async function createChat(chatTitle: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/api/chat"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatTitle }),
    });
  } catch {
    throw connectionError();
  }

  if (!res.ok) {
    throw await parseApiError(res, "Failed to create chat.");
  }

  const data = (await res.json()) as ChatRecord;
  const chatId = getChatId(data);
  if (!chatId) {
    throw new Error("Chat was created but no chat ID was returned.");
  }

  return chatId;
}

export async function sendAuthenticatedReply({
  chatId,
  content,
  file,
  chatTitle,
}: AuthenticatedReplyOptions): Promise<{ reply: string; chatId: string }> {
  const resolvedChatId = chatId ?? (await createChat(chatTitle || content.slice(0, 60) || "New chat"));
  const formData = new FormData();
  formData.append("content", content);

  if (file) {
    formData.append("file", file);
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(`/api/chat/${resolvedChatId}/messages/send`), {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch {
    throw connectionError();
  }

  if (!res.ok) {
    throw await parseApiError(res, `API error ${res.status}`);
  }

  const data = (await res.json()) as MessageRecord;
  return {
    reply: extractMessageText(data),
    chatId: resolvedChatId,
  };
}

export async function fetchChatHistory(): Promise<ChatHistoryItem[]> {
  const data = await fetchChatHistoryRecords();
  return data.map((chat) => ({
    id: getChatId(chat),
    title: getChatTitle(chat),
    date: groupDate(getChatDateSource(chat)),
  })).filter((chat) => Boolean(chat.id));
}

function normalizeMessageRole(value: string | undefined): "user" | "assistant" {
  return value?.toUpperCase() === "AI" || value?.toUpperCase() === "ASSISTANT"
    ? "assistant"
    : "user";
}

export async function fetchChatMessages(chatId: string): Promise<ChatMessageItem[]> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/api/chat/${chatId}/messages`), {
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw connectionError();
  }

  if (!res.ok) {
    throw await parseApiError(res, "Failed to fetch chat messages");
  }

  const data = (await res.json()) as MessageRecord[];
  return data.map((message) => ({
    id: String(message.messageId ?? message.id ?? `${Math.random()}`),
    role: normalizeMessageRole(message.role),
    content: extractMessageText(message),
    createdAt: message.createdAt,
    attachmentUrl: message.attachmentUrl ?? message.fileUrl ?? null,
    attachmentName: message.attachmentName ?? message.fileName ?? null,
  }));
}

export async function clearChatHistory(): Promise<void> {
  try {
    const res = await fetch(apiUrl("/api/chat/history"), {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      return;
    }
  } catch {
    // Fall back to deleting chats one by one below.
  }

  const chats = await fetchChatHistory();
  await Promise.all(
    chats.map((chat) =>
      fetch(apiUrl(`/api/chat/${chat.id}`), {
        method: "DELETE",
        credentials: "include",
      })
    )
  );
}

export async function deleteChat(chatId: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/api/chat/${chatId}`), {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    throw connectionError();
  }

  if (!res.ok) {
    throw await parseApiError(res, "Failed to delete chat");
  }
}
