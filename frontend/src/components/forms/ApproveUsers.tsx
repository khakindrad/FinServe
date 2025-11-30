"use client";

import { usePendingUsers } from "@/hooks/usePendingUsers";
import { useState, useMemo } from "react";
import { exportToExcel } from "@/lib/exportExcel";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";

import { useToast } from "@/hooks/use-toast";
import { ApproveRejectDialog } from "@/components/ui/ApproveRejectDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function PendingUsersTable() {
  const { users, loading, reload } = usePendingUsers();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<any>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 5;

  // FILTERED DATA
  const filtered = useMemo(() => {
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // PAGINATED
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  async function handleApprove(id: number, name: string) {
    setDialog(null);

    // TODO: Call API here
    toast({ title: "Approved", description: `${name} approved successfully` });

    reload();
  }

  async function handleReject(id: number, name: string) {
    setDialog(null);

    toast({ title: "Rejected", description: `${name} rejected` });
    reload();
  }

  function exportData() {
    exportToExcel(users, "PendingUsers");
    toast({ title: "Exported", description: "Excel downloaded" });
  }

  // LOADING SKELETON
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-60" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
  <div className="p-6 flex justify-center">

    {/* CARD */}
    <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg border">

      {/* CARD HEADER */}
      <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
        <h2 className="text-xl font-semibold text-gray-800">
          Approve Users
        </h2>
      </div>

      {/* CARD CONTENT */}
      <div className="p-6 space-y-6">

        {/* Search + Export */}
        <div className="flex justify-between items-center">
          <Input
            type="text"
            placeholder="Search by name or email..."
            className="w-80 border rounded-lg shadow-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Button className="bg-black hover:bg-gray-800">
            Export Excel
          </Button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700">Created</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-gray-500 italic"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}

              {paginated.map((u) => (
                <TableRow
                  key={u.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          setDialog({
                            type: "approve",
                            id: u.id,
                            name: u.fullName,
                          })
                        }
                      >
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="hover:bg-red-700"
                        onClick={() =>
                          setDialog({
                            type: "reject",
                            id: u.id,
                            name: u.fullName,
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between mt-4 items-center">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>

          <p className="text-gray-600 font-medium">
            Page {page} / {totalPages}
          </p>

          <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>

      </div>
    </div>

    {/* Approve/Reject dialog */}
    {dialog && (
      <ApproveRejectDialog
        open={true}
        name={dialog.name}
        type={dialog.type}
        onClose={() => setDialog(null)}
        onConfirm={() =>
          dialog.type === "approve"
            ? handleApprove(dialog.id, dialog.name)
            : handleReject(dialog.id, dialog.name)
        }
      />
    )}
  </div>
);

}
