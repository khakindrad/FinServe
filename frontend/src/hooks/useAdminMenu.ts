// hooks/useAdminMenu.ts
"use client";
import { useState, useEffect } from "react";

export function useAdminMenu() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        // ----------- DUMMY MENU DATA -----------
        const dummyMenu = [
          {
            id: 1,
            name: "Dashboard",
            icon: "Home",
            order: 1,
            children: [
              { id: 11, name: "Overview", path: "/dashboard", order: 1 },
              { id: 12, name: "Reports", path: "/dashboard/reports", order: 2 },
            ],
          },
          {
            id: 2,
            name: "Users",
            icon: "Users",
            order: 2,
            children: [
              { id: 21, name: "All Users", path: "/users", order: 1 },
              { id: 22, name: "Roles", path: "/users/roles", order: 2 },
              { id: 23, name: "Permissions", path: "/users/permissions", order: 3 },
            ],
          },
          {
            id: 3,
            name: "Settings",
            icon: "Settings",
            order: 3,
            children: [
              { id: 31, name: "General", path: "/settings/general", order: 1 },
              { id: 32, name: "Security", path: "/settings/security", order: 2 },
            ],
          },
        ];

        // Sort modules & children by "order"
        const sorted = dummyMenu
          .sort((a: any, b: any) => a.order - b.order)
          .map((mod: any) => ({
            ...mod,
            children: mod.children.sort((a: any, b: any) => a.order - b.order),
          }));

        setMenu(sorted);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch dummy menu");
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return { menu, loading, error };
}
