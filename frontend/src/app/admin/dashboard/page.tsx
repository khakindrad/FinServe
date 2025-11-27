"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Truck, Store } from "lucide-react";
export default function AdminDashboard() {
  return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users, employees, vehicles, and monitor sales performance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={22} /> Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">1,245</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck size={22} /> Vehicles Listed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">320</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={22} /> Monthly Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₹ 4,80,000</p>
              </CardContent>
            </Card>
          </div>
        </div>
  );
}
