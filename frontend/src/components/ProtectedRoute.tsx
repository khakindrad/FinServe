"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Wait until user is fetched
    if (user !== undefined) {
      setLoading(false);
      if (!isAuthenticated) router.push("/login");
    }
  }, [user, isAuthenticated]);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
}
