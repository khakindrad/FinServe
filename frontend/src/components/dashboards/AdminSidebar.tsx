import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Users, UserCog, Truck, BarChart3 } from "lucide-react";
import { useAdminMenu } from "@/hooks/useAdminMenu";

const ICONS: { [key: string]: any } = { Users, UserCog, Truck, BarChart3 };

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const { menu, loading } = useAdminMenu();

  const initials = user?.fullName
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();
  if (loading) return <p className="p-6">Loading menu...</p>;

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
          {menu.map((group, idx) => {
            const Icon = ICONS[group.icon] || Users;
            return (
              <div key={idx}>
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Icon size={16} /> {group.label}
                </p>

                <div className="space-y-1 ml-4">
                  {group.children.map((item: any, i: number) => (
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
    </div>
  );
}
