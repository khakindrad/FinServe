"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideSearch } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";

type Role = {
  roleId: number;
  roleName: string;
};
export default function ModuleForm() {
  const [moduleOrder, setModuleOrder] = useState<number>(0);
  const [moduleName, setModuleName] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get last module order
        const orderData = await api.getLastModuleOrder();
        setModuleOrder(orderData.lastOrder + 10);
        // Get all roles
        const rolesData = await api.getRoles();
        setRoles(rolesData);
      } catch (err) {
        console.error("Error fetching module data:", err);
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
      order: moduleOrder,
      name: moduleName,
      description: moduleDesc,
      roleIds: selectedRoles.map((r) => r.roleId),
    };
    try {
      await api.addModule(payload);
      alert("Module added successfully!");
      // Optional: reset form
      setModuleName("");
      setModuleDesc("");
      setSelectedRoles([]);
      // Optionally refresh moduleOrder
      const orderData = await api.getLastModuleOrder();
      setModuleOrder(orderData.lastOrder + 10);
    } catch (err) {
      console.error("Error adding module:", err);
    }
  };

  return (
    <Card className="shadow-xl border rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Module</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label>Module Order</Label>
            <Input type="number" value={moduleOrder} disabled className="bg-gray-100" />
          </div>

          <div>
            <Label>Module Name</Label>
            <Input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="Enter module name"
            />
          </div>

          <div>
            <Label>Module Description</Label>
            <textarea
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              placeholder="Enter module description"
              className="w-full border rounded-md p-2 h-24"
            />
          </div>

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
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <LucideSearch className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4">
            Add Module
          </Button>
        </form>

        {/* Roles Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
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
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
