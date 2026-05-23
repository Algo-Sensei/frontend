const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

export const apiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export type MessageRecord = {
  messageId?: string | number | null;
  id?: string | number;
  role?: string;
  content?: string | null;
  response?: string | null;
  message?: string | null;
  reply?: string | null;
  text?: string | null;
  createdAt?: string;
  updatedAt?: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
};

export function extractMessageText(data: MessageRecord | null | undefined): string {
  if (!data) return "";

  return (
    data.content ??
    data.response ??
    data.message ??
    data.reply ??
    data.text ??
    ""
  );
}

export function connectionError(): Error {
  return new Error("Unable to connect to the server. Please check if the backend is running.");
}

export async function parseApiError(
  res: Response,
  fallbackMessage: string
): Promise<Error> {
  let message = fallbackMessage;

  try {
    const rawBody = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = JSON.parse(rawBody);

      message =
        payload?.message ??
        payload?.error ??
        payload?.content ??
        fallbackMessage;
    } else {
      const trimmedBody = rawBody.trim();
      message = trimmedBody || `${fallbackMessage} (${res.status} ${res.statusText})`;
    }
  } catch {
    message = `${fallbackMessage} (${res.status} ${res.statusText})`;
  }

  return new Error(message);
}

export { API_BASE_URL };
