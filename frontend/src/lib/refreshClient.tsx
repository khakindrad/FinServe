// lib/refreshClient.ts
import { setAccessToken } from "./auth";
import { API_BASE_URL } from "./api";

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // MUST include cookies (HttpOnly refresh)
      headers: {
        "Content-Type": "application/json",
      },
      // no body required if refresh token is cookie-only
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    // expected: { accessToken: "..." }
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      return data.accessToken;
    }

    return null;
  } catch (err) {
    console.error("refreshAccessToken error", err);
    return null;
  }
}
