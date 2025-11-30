// hooks/useLogin.ts
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
export function useLogin(
  setErrorMsg: (m: string) => void,
  setSuccessMsg: (m: string) => void,
  setAlertMsg: (m: string) => void
) {
  //const { setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  async function login(email: string, password: string) {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await api.login({ email, password });

      const { statusCode, data, message } = response;

      if (statusCode === 200) {
        if (data?.accessToken) setAccessToken(data.accessToken);
        //if (data?.user) setUser(data.user);
        if (data?.user) setUser(data.user);
        if (message) setSuccessMsg(message);

        return data.user.roles;
      }

      if (statusCode === 403) {
        const { id, emailVerified, mobileVerified } = data;

        if (!emailVerified) {
          const verifyEmail = await api.emailVerification({ id });
          setAlertMsg(
            verifyEmail.statusCode === 200
              ? `${message}, email verification sent`
              : `${message}, please contact administrator`
          );
        }

        if (!mobileVerified) {
          const verifyMobile = await api.mobileVerification({ id });
          setAlertMsg(
            verifyMobile.statusCode === 200
              ? `${message}, OTP sent to mobile`
              : `${message}, please contact administrator`
          );
        }
      }

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong. Try again later.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return { login, loading };
}

