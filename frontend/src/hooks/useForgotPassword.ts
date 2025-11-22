"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export function useForgotPassword(
  setErrorMsg: any,
  setSuccessMsg: any
) {
  const [loading, setLoading] = useState(false);

  async function sendResetLink(email: string) {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      //const res = await api.forgotPassword({ email });
      setSuccessMsg("Reset link has been sent to your email.");
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to send reset link. Try again.");
    }
    setLoading(false);
  }
  return { sendResetLink, loading };
}
