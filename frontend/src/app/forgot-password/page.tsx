"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
      <Card className="w-full max-w-md shadow-xl border rounded-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">
            Reset Password
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Enter your registered email to receive reset instructions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>

          {/* Reset Button */}
          <Button className="w-full h-11 text-lg">
            Send Reset Link
          </Button>

          {/* Back to Login */}
          <div className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
