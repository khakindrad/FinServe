"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/dashboards/AdminDashboardLayout";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}
