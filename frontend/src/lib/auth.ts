// lib/auth.ts
// Access token stored ONLY in memory (clearest, safest)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

// Logout on client: clear memory token and call backend logout endpoint elsewhere
export function clientLogoutCleanup() {
  clearAccessToken();
  // cannot clear HttpOnly cookie from JS - backend must clear it via /auth/logout
}
export function hasAccessToken() {
  return accessToken !== null;
}