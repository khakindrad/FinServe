"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { clearAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logout);
  const router = useRouter();

  function handleLogout() {
    clearAccessToken();
    logoutUser();
    router.push("/login");
  }

  return (
    <nav className="w-full py-5 px-6 md:px-20 flex justify-between items-center bg-white/80 backdrop-blur border-b">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        FinServe
      </h1>

      <div className="flex items-center gap-4">

        {/* MOBILE TOGGLE BUTTON — ONLY WHEN LOGGED IN */}
        {user && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded border text-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* LOGIN/LOGOUT BUTTONS */}
        {user ? (
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
