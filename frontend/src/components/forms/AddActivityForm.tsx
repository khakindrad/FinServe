"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideSearch } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";

type Role = { roleId: number; roleName: string; };
type Module = { moduleId: number; moduleName: string; };

export default function ActivityForm() {
  const [moduleName, setModuleName] = useState(""); 
  const [modules, setModules] = useState<Module[]>([]); 
  const [moduleModalOpen, setModuleModalOpen] = useState(false);

  const [activityOrder, setActivityOrder] = useState<number>(0);
  const [activityName, setActivityName] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [modulesData, lastOrderData, rolesData] = await Promise.all([
          api.getModules(),
          api.getLastActivityOrder(),
          api.getRoles(),
        ]);

        setModules(modulesData);
        setActivityOrder(lastOrderData.lastOrder + 10);
        setRoles(rolesData);
      } catch (err) {
        console.error("Error fetching activity data:", err);
      }
    }

    fetchData();
  }, []);

  const toggleRoleSelection = (role: Role) => {
    if (selectedRoles.find((r) => r.roleId === role.roleId)) {
      setSelectedRoles(selectedRoles.filter((r) => r.roleId !== role.roleId));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      moduleName,
      order: activityOrder,
      name: activityName,
      description: activityDesc,
      roleIds: selectedRoles.map((r) => r.roleId),
    };

    try {
      await api.addActivity(payload);
      alert("Activity added successfully!");
      setModuleName("");
      setActivityName("");
      setActivityDesc("");
      setSelectedRoles([]);
      const lastOrderData = await api.getLastActivityOrder();
      setActivityOrder(lastOrderData.lastOrder + 10);
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  return (
    <Card className="shadow-xl border rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Module Name with search */}
          <div>
            <Label>Module Name</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Select or type module name"
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => setModuleModalOpen(true)}>
                <LucideSearch className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Activity Order */}
          <div>
            <Label>Activity Order</Label>
            <Input type="number" value={activityOrder} disabled className="bg-gray-100" />
          </div>

          {/* Activity Name */}
          <div>
            <Label>Activity Name</Label>
            <Input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Enter activity name"
            />
          </div>

          {/* Activity Description */}
          <div>
            <Label>Activity Description</Label>
            <textarea
              value={activityDesc}
              onChange={(e) => setActivityDesc(e.target.value)}
              placeholder="Enter activity description"
              className="w-full border rounded-md p-2 h-24"
            />
          </div>

          {/* Accessible Roles */}
          <div>
            <Label>Accessible Roles</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={selectedRoles.map((r) => r.roleName).join(", ")}
                readOnly
                placeholder="Select roles..."
                className="flex-1 bg-gray-100"
              />
              <Button variant="outline" size="sm" onClick={() => setRoleModalOpen(true)}>
                <LucideSearch className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4">
            Add Activity
          </Button>
        </form>
      </CardContent>

      {/* Module selection modal */}
      <Dialog open={moduleModalOpen} onOpenChange={setModuleModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Module</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto mt-4 space-y-2">
            {modules.map((mod) => (
              <div
                key={mod.moduleId}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() => {
                  setModuleName(mod.moduleName);
                  setModuleModalOpen(false);
                }}
              >
                <span>{mod.moduleName}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setModuleModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Roles selection modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Roles</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto mt-4 space-y-2">
            {roles.map((role) => (
              <div key={role.roleId} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!selectedRoles.find((r) => r.roleId === role.roleId)}
                  onChange={() => toggleRoleSelection(role)}
                  className="w-4 h-4"
                />
                <span>{role.roleName}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setRoleModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
