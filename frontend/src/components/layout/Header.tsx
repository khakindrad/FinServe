"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { getAccessToken, clearAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logout);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();
  function handleLogout() {
    clearAccessToken();      // remove token from storage
    logoutUser();            // clear zustand user
    router.push("/login");   // redirect to login
  }

  return (
    <nav className="w-full py-5 px-6 md:px-20 flex justify-between items-center bg-white/80 backdrop-blur border-b">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        FinServe
      </h1>

      <div className="flex gap-4">
        {getAccessToken() ? (
          <>
            <Button variant="outline" onClick={handleLogout}>
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
