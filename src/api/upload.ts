import { apiUrl } from "./client";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(apiUrl("/api/upload"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json();
  return data.url;
}
