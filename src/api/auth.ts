import { apiUrl } from "./client";

export type UserProfile = {
  userID?: number;
  name: string;
  email: string;
  profilePicture?: string;
  loginProvider?: string;
};

export type LoginProvider = "google" | "github";

export function getOAuthAuthorizationUrl(provider: LoginProvider) {
  return apiUrl(`/oauth2/authorization/${provider}`);
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any)?.message || "Invalid email or password.");
  }
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const res = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchLoginSession(): Promise<boolean> {
  const res = await fetch(apiUrl("/api/auth/session"), {
    method: "GET",
    credentials: "include",
  });

  return res.ok;
}

export async function logoutUser(): Promise<void> {
  const res = await fetch(apiUrl("/logout"), {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to log out");
  }
}
