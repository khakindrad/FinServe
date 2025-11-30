"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getAccessToken } from "@/lib/auth"; // your existing token getter

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken(); // read from localStorage or cookie

    // 1️⃣ No token → not authenticated → redirect
    if (!token) {
      router.push("/login");
      return;
    }

    // 2️⃣ Token exists but Zustand user not loaded yet → wait
    if (!user) {
      // Still loading user — allow skeletons etc.
      setChecking(false);
      return;
    }

    // 3️⃣ Token exists + user exists → authenticated
    setChecking(false);
  }, [user]);

  if (checking) return <div>Loading...</div>;

  return <>{children}</>;
}
