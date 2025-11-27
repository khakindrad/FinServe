"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {api} from "@/lib/api"
// PAGE START
export default function ApproveUsersPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedUsers, setSelectedUsers] = useState([]);

  // Pagination
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, fullName: "", type: "" });
  const [detailsModal, setDetailsModal] = useState({ open: false, user: null });

  // FETCH DATA
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  async function fetchPendingUsers() {
    try {
      setLoading(true);

      const res = await api.getPendingUsers();
      const json = await res.json();
      setPendingUsers(json.data || []);
      setFilteredUsers(json.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  // SEARCH + DATE FILTER
  useEffect(() => {
    let data = [...pendingUsers];

    if (search.trim() !== "") {
      data = data.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dateFrom) {
      data = data.filter((u) => new Date(u.createdAt) >= new Date(dateFrom));
    }

    if (dateTo) {
      data = data.filter((u) => new Date(u.createdAt) <= new Date(dateTo));
    }

    setFilteredUsers(data);
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, pendingUsers]);

  // PAGINATED DATA
  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // BULK SELECT
  function toggleSelect(id) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedUsers.length === paginatedData.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedData.map((u) => u.id));
    }
  }

  // SINGLE APPROVE / REJECT
  async function handleAction(id, type) {
    setActionLoading(id);

    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/users/${type}/${id}`, {
        method: "POST",
      });

      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setActionLoading(null);
      setConfirmModal({ open: false, id: null, fullName: "", type: "" });
    }
  }

  // BULK APPROVE / REJECT
  async function handleBulkAction(type) {
    for (const id of selectedUsers) {
      await handleAction(id, type);
    }
    setSelectedUsers([]);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pending User Approvals</h1>
      <p className="text-gray-600">Advanced admin approval with search, filters & bulk actions.</p>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or email…"
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {/* 🔘 BULK ACTION BUTTONS */}
      {selectedUsers.length > 0 && (
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleBulkAction("approve")}
          >
            Approve Selected ({selectedUsers.length})
          </Button>

          <Button
            variant="destructive"
            onClick={() => handleBulkAction("reject")}
          >
            Reject Selected ({selectedUsers.length})
          </Button>
        </div>
      )}

      {/* TABLE */}
      <Card className="shadow-xl border rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Pending Users</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>
          ) : paginatedData.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border-b">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedData.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 border-b text-left">Name</th>
                    <th className="p-3 border-b text-left">Email</th>
                    <th className="p-3 border-b text-left">Created</th>
                    <th className="p-3 border-b text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 border-b">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                        />
                      </td>

                      <td className="p-3 font-semibold">{user.fullName}</td>

                      <td className="p-3">{user.email}</td>

                      <td className="p-3 text-gray-500">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>

                      <td className="p-3 text-right flex justify-end gap-2">

                        {/* VIEW DETAILS */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailsModal({ open: true, user })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* APPROVE */}
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              id: user.id,
                              fullName: user.fullName,
                              type: "approve",
                            })
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>

                        {/* REJECT */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              id: user.id,
                              fullName: user.fullName,
                              type: "reject",
                            })
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          <div className="flex justify-between items-center py-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span>
              Page <strong>{currentPage}</strong> of{" "}
              {Math.ceil(filteredUsers.length / pageSize)}
            </span>

            <Button
              variant="outline"
              disabled={currentPage === Math.ceil(filteredUsers.length / pageSize)}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CONFIRMATION MODAL */}
      <Dialog open={detailsModal.open} onOpenChange={() => setDetailsModal({ open: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmModal.type === "approve" ? "Approve User" : "Reject User"}
            </DialogTitle>
          </DialogHeader>

          <p>
            Are you sure you want to{" "}
            <strong className="capitalize">{confirmModal.type}</strong>{" "}
            the user: <strong>{confirmModal.fullName}</strong>?
          </p>

          <DialogFooter>
            <Button  variant="outline" onClick={() =>setConfirmModal({open: false,id: null, fullName: "",type: ""})}>
              Cancel
            </Button>
            <Button
              className={
                confirmModal.type === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              onClick={() => handleAction(confirmModal.id, confirmModal.type)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAILS MODAL */}
      <Dialog open={detailsModal.open} onOpenChange={() => setDetailsModal({ open: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {detailsModal.user && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {detailsModal.user.fullName}</p>
              <p><strong>Email:</strong> {detailsModal.user.email}</p>
              <p><strong>Created:</strong> {new Date(detailsModal.user.createdAt).toLocaleString()}</p>
              <p><strong>Roles:</strong> {detailsModal.user.userRoles.length === 0 ? "No Roles" : detailsModal.user.userRoles.map(r => r.roleName).join(", ")}</p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsModal({ open: false, user: null })}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
