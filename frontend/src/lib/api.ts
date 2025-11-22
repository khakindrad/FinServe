// lib/api.ts
import { getAccessToken, setAccessToken, clearAccessToken } from "./auth";
import { refreshAccessToken } from "./refreshClient";
import { normalizeHeaders } from "./utils";

export const API_BASE_URL = "http://localhost:54022/api";

// -----------------------------
// RAW REQUEST (no retry logic)
// -----------------------------
async function rawRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...normalizeHeaders(options.headers || {}),
  };
  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: baseHeaders,
    credentials: "include", // send refresh cookie
  });

  return res;
}

// -----------------------------
// MAIN REQUEST WRAPPER
// -----------------------------
async function request(path: string, options: RequestInit = {}) {

  // 1) Try first call normally
  let res = await rawRequest(path, options);

  // 2) If unauthorized → try refreshing access token
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      // retry again after token refresh
      res = await rawRequest(path, options);
    } else {
      clearAccessToken();
      throw new Error("Session expired. Please login again.");
    }
  }

  // 3) If still NOT OK → throw error
  if (!res.ok) {
    let errJson: any = null;

    try {
      errJson = await res.json();
    } catch {}

    const message =
      errJson?.message ||
      errJson?.error ||
      `Request failed: ${res.status}`;

    throw new Error(message);
  }

  // 4) Return JSON
  try {
    return await res.json();
  } catch {
    return null; // no body
  }
}

// -----------------------------
// EXPORT API METHODS
// -----------------------------
export const api = {
  // LOGIN
  login: (data: any) =>
    request("/Auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // GET CURRENT USER
  me: () =>
    request("/Auth/me", {
      method: "GET",
    }),

  // LOGOUT
  logout: () =>
    request("/Auth/logout", {
      method: "POST",
    }),
  refresh: () => 
    request("/Auth/refresh", { 
      method: "POST", 
    }),
};

