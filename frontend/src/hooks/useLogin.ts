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
      const res = await api.login({ email, password });
      if(res.statusCode===200)
      {
        if (res?.accessToken) {
          setAccessToken(res.data.accessToken);
        }
        if (res?.data.user) {
          setUser(res.data.user);
        } 
        if(res?.message)
        {
          setSuccessMsg(res.message);
        }
        return res.data.user.roles;
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong, Please Try again later.");
    } finally {
      setLoading(false);
    }
  }
  return { login, loading };
}
