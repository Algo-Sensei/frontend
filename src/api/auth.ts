import { apiUrl } from "./client";

export type UserProfile = {
  userID?: number;
  name: string;
  email?: string;  // May be null for GitHub users with private email
  provider?: string;  // "google" or "github"
  providerId?: string;  // Stable identifier from provider
  profilePicture?: string;
  loginProvider?: string;
};

export type LoginProvider = "google" | "github";

export function getOAuthAuthorizationUrl(provider: LoginProvider) {
  const url = new URL(apiUrl(`/oauth2/authorization/${provider}`));

  // GitHub doesn't support OIDC's prompt=select_account parameter.
  // Instead, the backend GitHubAuthorizationRequestResolver appends &login=
  // to force the account chooser. No need to add anything here.
  //
  // Google supports prompt=select_account, but it's optional.
  if (provider === "google") {
    url.searchParams.set("prompt", "select_account");
  }

  return url.toString();
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
  const res = await fetch(apiUrl("/api/auth/me"), {
    credentials: "include",
    cache: "no-store",
  });

  // 401 = not authenticated, return null gracefully
  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    return null;
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  const data = await res.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return null;
  }

  return data as UserProfile;
}

export async function fetchLoginSession(): Promise<boolean> {
  const user = await fetchCurrentUser();
  return user !== null;
}

export async function logoutUser(): Promise<void> {
  const res = await fetch(apiUrl("/logout"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to log out");
  }
}
