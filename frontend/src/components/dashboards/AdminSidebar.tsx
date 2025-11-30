"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Users,
  UserCog,
  Truck,
  BarChart3,
  LogOut
} from "lucide-react";

import { useAdminMenu } from "@/hooks/useAdminMenu";

// map icons by name so dummy data works
const ICONS: Record<string, any> = {
  Users,
  UserCog,
  Truck,
  BarChart3
};

export default function AdminSidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const menu = user?.menus || [];
  const initials = user?.fullName
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="p-6 flex flex-col h-full justify-between">
      {/* TOP USER INFO */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Avatar className="h-14 w-14">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold">{user?.fullName}</h3>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>

        {/* MENU GROUPS */}
        <div className="space-y-6">
          {menu.map((group: any, idx: number) => {
            const Icon = ICONS[group.icon] || Users;

            return (
              <div key={idx}>
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Icon size={16} /> {group.name}
                </p>

                <div className="space-y-1 ml-4">
                  {group.children.map((item: any, i: number) => {
                    const href = item.route || "/"; // fallback to home

                    return (
                      <Link key={i} href={href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                        >
                          {item.name || "Unnamed"}
                        </Button>
                      </Link>
                    );
                  })}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOGOUT BUTTON */}
      <div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
