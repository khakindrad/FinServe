import axios from "axios";

const api = axios.create({
  baseURL: "https://api.yourdomain.com/api", // your .NET Core endpoint
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
