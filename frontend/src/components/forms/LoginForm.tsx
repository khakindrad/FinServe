"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { saveAuthTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // 🔴 Show inline error message
  const { setUser } = useAuth();

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // clear previous error

    try {
      const email = (document.getElementById("email") as HTMLInputElement).value;
      const password = (document.getElementById("password") as HTMLInputElement).value;
      const DeviceInfo=null;
      const res = await api.login({ email, password });

      // save tokens
      saveAuthTokens(res.token, res.refreshToken);
      // save user globally
      setUser(res.user);
      // go to dashboard
      router.push("/User/dashboard");

    } catch (err: any) {
      // 🔴 Show error message inside form
      setErrorMsg(err.message || "Invalid email or password");
    }

    setLoading(false);
  }

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      
      {/* 🔴 Error Message */}
      {errorMsg && (
        <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 p-2 rounded-md">
          {errorMsg}
        </p>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Input id="email" type="email" placeholder="you@example.com" className="pl-10" required />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>

        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-12"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="w-full flex justify-start">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Login */}
      <Button type="submit" className="w-full h-11 text-lg" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center text-sm text-gray-500">
        Don’t have an account?{" "}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">
          Create one
        </Link>
      </div>
    </form>
  );
}
