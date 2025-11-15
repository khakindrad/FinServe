import { api } from "./api";
import { getRefreshToken, saveAuthTokens } from "./auth";

export async function refreshAccessToken() {
  try {
    const rToken = getRefreshToken();
    if (!rToken) return null;

    const res = await api.refreshToken(rToken);
    saveAuthTokens(res.token, res.refreshToken);

    return res.token;
  } catch {
    return null;
  }
}
