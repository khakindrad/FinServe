"use client";

import AdminSidebar from "@/components/dashboards/AdminSidebar";

export default function AdminLayout({ children }: any) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-4 gap-0">
      <main className="col-span-3 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
