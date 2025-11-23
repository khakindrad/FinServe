"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  console.log(isAuthenticated)
  return (
    <nav className="w-full py-5 px-6 md:px-20 flex justify-between items-center bg-white/80 backdrop-blur border-b">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        FinServe
      </h1>

      <div className="flex gap-4">
        {isAuthenticated ? (
          <>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
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
