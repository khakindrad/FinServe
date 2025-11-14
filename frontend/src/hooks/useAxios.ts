// src/hooks/useAxios.ts
"use client";
import { useMemo } from "react";
import axiosClient from "@/lib/axiosClient";
import { useAuth } from "@/hooks/useAuth";

export const useAxios = () => {
  const { token } = useAuth();

  // create memoized instance
  const instance = useMemo(() => {
    const client = axiosClient;
    if (token) {
      client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common["Authorization"];
    }
    return client;
  }, [token]);

  return instance;
};
