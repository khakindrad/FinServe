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
            name: "App Management",
            icon: "Home",
            order: 1,
            children: [
              { id: 11, name: "Add Module", path: "/admin/dashboard/app-management/add-module", order: 1 },
              { id: 12, name: "Add Activiy", path: "/admin/dashboard/app-management/add-activity", order: 2 },
            ],
          },
          {
            id: 2,
            name: "User Management",
            order: 2,
            children: [
              { id: 21, name: "Approve Users", path: "/admin/dashboard/user-management/approve-user", order: 1 },
              { id: 22, name: "All Users", path: "/admin/dashboard/user-management/all-users", order: 2 },
              { id: 23, name: "All Roles", path: "/admin/dashboard/user-management/get-roles", order: 3 },
            ],
          },
          {
            id: 3,
            name: "Settings",
            icon: "Settings",
            order: 3,
            children: [
              { id: 31, name: "General", path: "#", order: 1 },
              { id: 32, name: "Security", path: "#", order: 2 },
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
