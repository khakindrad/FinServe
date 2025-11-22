import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Enter your registered email to receive reset instructions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <ForgotPasswordForm />

          <div className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
