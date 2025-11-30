import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Link, LogOut, Users } from "lucide-react";
import { Button } from "../ui/button";

function SidebarContent({ closeSidebar }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const menu = user?.menus || [];

  const initials = user?.fullName
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col h-full justify-between">
      {/* PROFILE */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Avatar className="h-14 w-14">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold">{user?.fullName}</h3>
            <p className="text-sm text-gray-500">
              {user?.roles?.join(", ") || "User"}
            </p>
          </div>
        </div>

        {/* MENU LIST */}
        <div className="space-y-6">
          {menu.map((group: any, idx: number) => {
            const Icon = group.icon || Users;

            return (
              <div key={idx}>
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Icon size={16} /> {group.name}
                </p>

                <div className="space-y-1 ml-4">
                  {group.children.map((item: any, i: number) => (
                    <Link key={i} href={item.route || "/"} onClick={closeSidebar}>
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

      {/* LOGOUT */}
      <div className="pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50"
          onClick={() => {
            logout();
            closeSidebar?.();
          }}
        >
          <LogOut size={16} className="mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
