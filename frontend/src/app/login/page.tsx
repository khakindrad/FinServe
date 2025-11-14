"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { motion } from "framer-motion";
import { useValidation } from "@/hooks/useValidation";
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");


    const isEmailValid = useValidation(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    const isPasswordValid = useValidation(password, /^(?=.*[A-Z])(?=.*\d).{8,}$/);
    // Email validation
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }
    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return; // Stop if validation fails

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response) router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-[400px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-white">
              FinServe
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-300 mt-1">
              Sign in to access your financial dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="flex flex-col">
                <label className="text-slate-600 dark:text-slate-300 text-sm mb-1 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400"
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">
                    Password
                  </label>
                 
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400"
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
                 <a
                    href="/forgot-password"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </a>
              </div>

              {/* General Error */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg py-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Register
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
