"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

import {
  Users,
  UserCog,
  BadgeCheck,
  Store,
  Truck,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const adminMenu = [
    {
      label: "User Management",
      children: [
        { name: "Approve Users", href: "/admin/users/approve" },
        { name: "Block Users", href: "/admin/users/block" },
        { name: "Activate Users", href: "/admin/users/activate" },
        { name: "Inactivate Users", href: "/admin/users/inactivate" },
        { name: "User Details", href: "/admin/users/details" },
      ],
      icon: Users,
    },
    {
      label: "Employee Management",
      children: [
        { name: "Approve Employees", href: "/admin/employees/approve" },
        { name: "Block Employees", href: "/admin/employees/block" },
        { name: "Employee Details", href: "/admin/employees/details" },
      ],
      icon: UserCog,
    },
    {
      label: "Sales",
      children: [
        { name: "Sales Overview", href: "/admin/sales" },
        { name: "Revenue Reports", href: "/admin/sales/reports" },
      ],
      icon: BarChart3,
    },
    {
      label: "Vehicles",
      children: [
        { name: "Listed Vehicles", href: "/admin/vehicles" },
        { name: "Pending Approval", href: "/admin/vehicles/pending" },
      ],
      icon: Truck,
    },
  ];

  return (
    <div className="p-6 flex flex-col h-full justify-between">
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

        <div className="space-y-6">
          {adminMenu.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx}>
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Icon size={16} /> {group.label}
                </p>

                <div className="space-y-1 ml-4">
                  {group.children.map((item, i) => (
                    <Link key={i} href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        onClick={logout}
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl"
      >
        <LogOut size={18} className="mr-2" /> Logout
      </Button>
    </div>
  );
}
