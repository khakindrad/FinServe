// hooks/useLogin.ts
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function useLogin(setErrorMsg: (m: string) => void, setSuccessMsg: (m: string) => void) {
  const { setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    setErrorMsg("");

    try {
      // login must be called with credentials (cookie)
      const res = await api.login({ email, password });

      // EXPECTED BACKEND BEHAVIOR:
      // 1) backend sets HttpOnly refresh cookie
      // 2) backend may return { user, accessToken } or just { user }
      // If accessToken exists, store in memory:
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
      }

      if (res?.user) {
        setUser(res.user);
      } else {
        // optionally call api.me() to populate
        const me = await api.me();
        if (me?.user) setUser(me.user);
      }
      setSuccessMsg("Login successful");
      const isAdmin = res?.user?.role?.includes?.("Admin") ?? false;
      router.push(isAdmin ? "/admin/dashboard" : "/User/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }
  return { login, loading };
}
