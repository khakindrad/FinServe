// src/lib/axiosClient.ts
import axios from "axios";
import { env } from "@/config/env"; //To fetch environment variables

// ✅ Create Axios instance
const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor – add Authorization token automatically
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or from cookies if needed
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor – handle global errors (like 401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized - maybe token expired!");
      // Optional: redirect to login page
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
