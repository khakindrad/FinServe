"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import AdminSidebar from "@/components/dashboards/AdminSidebar";
import { useAuthStore } from "@/store/useAuthStore";

import "./globals.css";

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const pathname = usePathname();

  // ⭐ AUTO-CLOSE SIDEBAR ON NAVIGATION (MOBILE ONLY)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {user ? (
            <div className="flex flex-col md:flex-row flex-1">

              {/* SIDEBAR */}
              <div
                className={`
                  bg-white border-r shadow-lg transition-all duration-300
                  md:w-1/4
                  ${sidebarOpen ? "block" : "hidden md:block"}
                `}
              >
                <AdminSidebar />
              </div>

              {/* MAIN */}
              <main className="flex-1 bg-gray-50 p-6">
                {children}
              </main>
            </div>
          ) : (
            <main className="flex-1">{children}</main>
          )}

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
