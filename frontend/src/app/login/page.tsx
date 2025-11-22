import LoginForm from "@/components/forms/LoginForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
      <Card className="w-full max-w-md shadow-xl border rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Login to access your FinServe dashboard 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
