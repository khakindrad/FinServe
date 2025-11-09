import axios from "axios";

const api = axios.create({
  baseURL: "https://your-backend-api-url/api",
});

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.accessToken);
  return res.data;
}
