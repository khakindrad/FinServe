import RegisterForm from "@/components/forms/RegisterForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-white">
      <Card className="w-full max-w-4xl shadow-xl border rounded-2xl">
        
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Register to access your personalized financial dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-12 md:px-12 px-4">
          <RegisterForm />
        </CardContent>

      </Card>
    </div>
  );
}
