"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* USER CARD */}
      <Card className="max-w-xl shadow-md border">
        <CardHeader>
          <CardTitle className="text-xl">Welcome, {user.firstName} 👋</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-gray-700">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toDateString()}</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-md border hover:shadow-xl transition">
          <h3 className="text-lg font-semibold">View Transactions</h3>
          <p className="text-sm text-gray-600 mt-1">Check your financial activity.</p>
        </Card>

        <Card className="p-6 shadow-md border hover:shadow-xl transition">
          <h3 className="text-lg font-semibold">Manage Profile</h3>
          <p className="text-sm text-gray-600 mt-1">Update your personal details.</p>
        </Card>

        <Card className="p-6 shadow-md border hover:shadow-xl transition">
          <h3 className="text-lg font-semibold">Security Settings</h3>
          <p className="text-sm text-gray-600 mt-1">Manage login & security.</p>
        </Card>
      </div>
    </div>
  );
}
