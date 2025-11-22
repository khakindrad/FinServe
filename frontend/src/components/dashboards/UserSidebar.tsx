"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { User, Wallet, CreditCard, Bell, Settings } from "lucide-react";
import Link from "next/link";

export default function UserSidebar() {
  const { user, logout } = useAuth();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const menuItems = [
    { name: "Profile", icon: User, href: "/User/profile" },
    { name: "Accounts", icon: Wallet, href: "/User/accounts" },
    { name: "Transactions", icon: CreditCard, href: "/User/transactions" },
    { name: "Notifications", icon: Bell, href: "/User/notifications" },
    { name: "Settings", icon: Settings, href: "/User/settings" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg h-full p-6 flex flex-col justify-between border border-gray-100">

      {/* User Profile */}
      <div>
        <div className="flex items-center gap-4 mb-10">
          <Avatar className="h-16 w-16 shadow-sm ring-2 ring-blue-100">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">{user?.fullName}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl py-2 shadow-sm hover:shadow-md"
                >
                  <Icon className="mr-3 h-4 w-4 text-gray-600" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 shadow-md mt-8"
        onClick={logout}
      >
        Logout
      </Button>

    </div>
  );
}
