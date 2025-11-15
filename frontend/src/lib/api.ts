export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:54022/api";

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API Error" }));
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}
export const api = {
  getProfile: () =>
  request("/user/profile", {
    method: "GET"
  }),
  login: (data: any) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: any) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refreshToken: (rToken: string) =>
    request("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: rToken }),
    }),
};
