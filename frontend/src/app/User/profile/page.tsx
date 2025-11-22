"use client";

import { useAuth } from "@/context/AuthContext";
import UserDashboardLayout from "@/components/dashboards/UserDashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <UserDashboardLayout>
        <div className="p-10 text-center text-xl">Loading profile...</div>
      </UserDashboardLayout>
    );
  }
  const initials =
    user.fullName
      ?.trim()
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <UserDashboardLayout>
      <div className="w-full">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {/* Profile Card */}
        <Card className="w-full rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Avatar */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 shadow-md ring-2 ring-blue-200">
                <AvatarImage src={user.profileImage ?? ""} />
                <AvatarFallback className="uppercase">{initials}</AvatarFallback>
              </Avatar>

              <div>
                <p className="text-lg font-semibold">{user.fullName}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-6 pt-4">

              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input value={user.fullName} readOnly className="mt-1 bg-gray-100" />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={user.email} readOnly className="mt-1 bg-gray-100" />
              </div>

              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input value={user.id} readOnly className="mt-1 bg-gray-100" />
              </div>

              <div>
                <label className="text-sm font-medium">Role</label>
                <Input value={user.role?.join(", ")} readOnly className="mt-1 bg-gray-100" />
              </div>

            </div>

            <div className="pt-6">
              <Button disabled className="opacity-80 cursor-not-allowed">
                Edit Profile (Coming Soon)
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
}
