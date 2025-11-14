// src/config/env.ts
export const env = {
  apiBaseUrl_DEV: process.env.NEXT_PUBLIC_API_BASE_URL_DEV || "http://localhost:5000/api",
  apiBaseUrl_PROD: process.env.NEXT_PUBLIC_API_BASE_URL_PROD || "http://3.238.174.167:5005/api",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "FinServe",
  environment: process.env.NEXT_PUBLIC_ENV || "development",
};
