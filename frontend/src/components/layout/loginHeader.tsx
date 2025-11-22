"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppNavbar() {
  const { user, isAuthenticated } = useAuth();

  const [dateTime, setDateTime] = useState("");

  // Auto-update current date+time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setDateTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) return null; // 🔥 hide navbar if user not logged in

  const initials =
    user?.fullName
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <nav className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      
      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Notification bell */}
        <button className="relative hover:bg-gray-100 p-2 rounded-full transition">
          <Bell size={22} className="text-gray-700" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Date + Time */}
        <p className="text-sm text-gray-600 hidden md:block">
          {dateTime}
        </p>

        {/* Avatar */}
        <Avatar className="h-9 w-9 ring-1 ring-gray-200 shadow-sm">
          <AvatarImage src={user?.profileImage ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

      </div>
    </nav>
  );
}
