export function saveAuthTokens(token: string, refreshToken: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
}

export function getAccessToken() {
  return localStorage.getItem("token");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}
