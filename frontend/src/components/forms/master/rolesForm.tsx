"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import AppAlert from "@/components/common/AppAlert";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function RolesPage() {
  // FORM STATES
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editRoleId, setEditRoleId] = useState("");

  // LOADING
  const [loading, setLoading] = useState(true);

  // UI
  const [showForm, setShowForm] = useState(false);

  // MESSAGES
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // SEARCH
  const [search, setSearch] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ROLES LIST
  const [roles, setRoles] = useState([]);

  async function loadRoles() {
    setLoading(true);
    const res = await api.getRoles();
    setRoles(res?.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadRoles();
  }, []);

  // AUTO CLEAR MESSAGES
  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (isEditing) {
        // await api.updateRole(editRoleId, { name: roleName, description, isActive });
        setSuccessMsg("Role updated successfully!");
      } else {
        await api.addRoles({ name: roleName, description, isActive });
        setSuccessMsg("Role added successfully!");
      }

      loadRoles();
      resetForm();
      setShowForm(false);

    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
    }
  }

  function resetForm() {
    setRoleName("");
    setDescription("");
    setIsActive(true);
    setIsEditing(false);
    setEditRoleId("");
  }

  function handleEdit(role) {
    setRoleName(role.name);
    setDescription(role.description);
    setIsActive(role.isActive);
    setEditRoleId(role.id);

    setIsEditing(true);
    setShowForm(true);
  }

  function handleToggle(role) {
    // api.updateRole(role.id, { ...role, isActive: !role.isActive });
    loadRoles();
  }

  // FILTER
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredRoles.length / pageSize);

  // SKELETON
  const TableSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center bg-white rounded-lg p-4 border shadow-sm">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-60" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  );

  const FormSkeleton = () => (
    <div className="mb-8 bg-gray-50 p-6 rounded-lg border space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );

  return (
    <div className="p-6 flex justify-center">

      <Card className="w-full max-w-5xl shadow-md border rounded-xl">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">Roles Management</CardTitle>
        </CardHeader>

        <CardContent>

          {errorMsg && <AppAlert type="error" message={errorMsg} />}
          {successMsg && <AppAlert type="success" message={successMsg} />}

          {/* TOP BAR */}
          {!showForm && !loading && (
            <div className="flex justify-between items-center mb-6">
              
              {/* Search Box with Icon */}
              <div className="relative max-w-xs">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ADD BUTTON */}
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-blue-600 flex items-center gap-2"
              >
                <Plus size={18} /> Add Role
              </Button>

            </div>
          )}

          {/* TOP BAR SKELETON */}
          {!showForm && loading && (
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-28" />
            </div>
          )}

          {/* FORM SKELETON */}
          {showForm && loading && <FormSkeleton />}

          {/* FORM */}
          {showForm && !loading && (
            <div className="mb-8 bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? "Edit Role" : "Create Role"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Name</label>
                  <Input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
                  <span className="text-sm font-medium">Is Active</span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" className="bg-blue-600 text-white">
                    {isEditing ? "Update Role" : "Save Role"}
                  </Button>
                </div>

              </form>
            </div>
          )}

          {/* TABLE SKELETON */}
          {!showForm && loading && <TableSkeleton />}

          {/* TABLE */}
          {!showForm && !loading && (
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRoles.map((role) => (
                    <tr key={role.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{role.name}</td>
                      <td className="p-3">{role.description}</td>
                      <td className="p-3">
                        {role.isActive ? (
                          <span className="text-green-700 font-medium">Active</span>
                        ) : (
                          <span className="text-red-700 font-medium">Inactive</span>
                        )}
                      </td>

                      <td className="p-3 text-right space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(role)}>
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant={role.isActive ? "destructive" : "default"}
                          onClick={() => handleToggle(role)}
                        >
                          {role.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </CardContent>

        {/* PAGINATION */}
        {!showForm && !loading && (
          <CardFooter className="flex justify-between items-center p-4">
            
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={18} /> Previous
            </Button>

            <span className="text-gray-700 font-medium">
              Page {currentPage} / {totalPages}
            </span>

            <Button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </Button>

          </CardFooter>
        )}

      </Card>
    </div>
  );
}
