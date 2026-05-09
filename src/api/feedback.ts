import { apiUrl } from "./client";

export type FeedbackPayload = {
  name: string;
  lastname: string;
  email: string;
  phone?: string;
  description: string;
};

export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  const res = await fetch(apiUrl("/api/feedback"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any)?.message || "Could not send your message.");
  }
}
