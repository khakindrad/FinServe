"use client";

import UserSidebar from "./UserSidebar";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
      {/* Sidebar - Left (1 column) */}
      <div className="col-span-1">
        <UserSidebar />
      </div>

      {/* Main content - Right (3 columns) */}
      <div className="col-span-3">
        {children}
      </div>
    </div>
  );
}
