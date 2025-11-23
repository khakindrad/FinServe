// hooks/useAdminMenu.ts
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function useAdminMenu() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const data = await api.getMenu();
        // Sort modules & children by order
        const sorted = data
          .sort((a: any, b: any) => a.order - b.order)
          .map((mod: any) => ({
            ...mod,
            children: mod.children.sort((a: any, b: any) => a.order - b.order),
          }));

        setMenu(sorted);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch menu");
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return { menu, loading, error };
}
