import api from "./api";

export const login = async (email: string, password: string) => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("auth_token", data.token);
  return data;
};

export const register = async (payload: any) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const logout = () => {
  localStorage.removeItem("auth_token");
};
