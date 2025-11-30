"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

import AppAlert from "@/components/common/AppAlert";
import { useFormMessages } from "@/hooks/useFormMessages";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { validateField } from "@/lib/validators";
import { patterns } from "@/lib/patterns";
import {useRouter} from "next/navigation";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { errorMsg, successMsg, setErrorMsg, setSuccessMsg } =
    useFormMessages();
  const { sendResetLink, loading } = useForgotPassword(
    setErrorMsg,
    setSuccessMsg
  );

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});

  function handleSubmit(e: any) {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    // Validate email
    const emailErr = validateField(email, "Email", patterns.email);

    if (emailErr) {
      setErrors({ email: emailErr });
      setErrorMsg(emailErr); // Global message when single field error
      return;
    }
    // Call API
    sendResetLink(email);

  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Alerts */}
      {errorMsg && <AppAlert type="error" message={errorMsg} />}
      {successMsg && <AppAlert type="success" message={successMsg} />}
      {/* Email Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email Address</label>

        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
        )}
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 text-lg">
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
