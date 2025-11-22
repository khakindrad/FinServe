"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import UserDashboardLayout from "@/components/dashboards/UserDashboardLayout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { getAccessToken  } from "@/lib/auth"; 
export default function DashboardPage() {
  const { user } = useAuth();
 
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  }
  return (
    <UserDashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl shadow-md p-6">
          <h3 className="text-2xl font-bold mb-4">Welcome back, {user.fullName.split(" ")[0]}! 👋</h3>
          <p className="text-gray-600 mb-6">Here’s a quick overview of your financial activity.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Account Balance</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">₹ {user.balance ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Investments</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">₹ {user.investments ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Monthly Expenses</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">₹ {user.expenses ?? 0}</p></CardContent>
            </Card>
          </div>
        </Card>
      </motion.div>
    </UserDashboardLayout>
  );
}
