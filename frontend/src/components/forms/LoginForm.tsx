"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Navigation } from "lucide-react";
import AppAlert from "@/components/common/AppAlert";
import { useFormMessages } from "@/hooks/useFormMessages";
import { useLogin } from "@/hooks/useLogin";
import { validateField } from "@/lib/validators";
import { patterns } from "@/lib/patterns";
import { useRouter } from "next/navigation";


export default function LoginForm() {

  const router = useRouter();
  const { errorMsg, setErrorMsg, successMsg, setSuccessMsg,alertMsg,setAlertMsg } = useFormMessages();
  const { login, loading } = useLogin(setErrorMsg, setSuccessMsg,setAlertMsg);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});


  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  //Form Submitting
  async function handleSubmit(e: any) {

    e.preventDefault();
    setErrorMsg("");
    setErrors({});

    let newErrors: any = {};
    const validations = [
      { field: "email", label: "Email", pattern: patterns.email },
      { field: "password", label: "Password", pattern: patterns.strongPassword },
    ];

    validations.forEach(({ field, label, pattern }) => {
      const result = validateField(form[field], label, pattern);
      if (result) newErrors[field] = result;
    });

    if (Object.keys(newErrors).length > 0) {
       setErrors(newErrors);
      if (Object.keys(newErrors).length === 1) {
        setErrorMsg(Object.values(newErrors)[0] as string);
      } else {
        setErrorMsg(""); 
      }
      return;
    }

    const roles=await login(form.email, form.password);
    if(roles)
    {
      const isAdmin = roles.includes("Admin");
      router.push("/admin/dashboard");
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && <AppAlert type="error" message={errorMsg} />}
      {successMsg && <AppAlert type="success" message={successMsg} />}
      {alertMsg && <AppAlert type="info" message={alertMsg} />}
      {/* EMAIL */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={loading}
            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
          />
        </div>
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            disabled={loading}
            className={`pl-10 pr-12 ${errors.password ? "border-red-500" : ""}`}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-600">{errors.password}</p>
        )}

        <div className="text-left">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 text-lg">
        {loading ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center text-sm text-gray-500">
        Don’t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </div>
    </form>
  );
}
