"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddCountryDialog } from "@/components/forms/master/addCountry";
import { useStates } from "@/hooks/useStates";
import { exportToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddStateDialog } from "./addState";

export default function StatesPage() {
    const { toast } = useToast();
    const { states, loading, reload } = useStates();

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const PAGE_SIZE = 5;
    const filtered = useMemo(() => {
        return states.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [states, search]);
    const [page, setPage] = useState(1);
    // PAGINATED
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    function exportData() {
        exportToExcel(states, "State Details");
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
            <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg border">

                {/* HEADER */}
                {/* HEADER */}
                <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Manage States</h2>

                    <div className="flex gap-3">
                        <Button onClick={exportData} className="bg-black hover:bg-gray-800">
                            Export Excel
                        </Button>

                        <Button onClick={() => setModalOpen(true)} className="bg-blue-600">
                            Add State
                        </Button>
                    </div>
                </div>


                {/* CONTENT */}
                <div className="p-6 space-y-6">

                    {/* Search */}
                    <Input
                        placeholder="Search country..."
                        value={search}
                        className="w-full sm:w-72 md:w-80 max-w-md"
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* TABLE */}
                    <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
                        <table className="min-w-[800px]">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">State</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                    <th className="px-4 py-3 text-left">Country</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-6 text-center text-gray-500 italic">
                                            No countries found
                                        </td>
                                    </tr>
                                )}

                                {paginated.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-t hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3">{c.name}</td>

                                        <td className="px-4 py-3">
                                            {c.isActive ? (
                                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-right space-x-2">
                                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                                Edit
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant={c.isActive ? "destructive" : "default"}
                                                className={c.isActive ? "" : "bg-green-600 hover:bg-green-700"}
                                            >
                                                {c.isActive ? "Deactivate" : "Activate"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                    {/*PAGINATION*/}
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

            {modalOpen && (
                <AddStateDialog open={modalOpen} onClose={() => setModalOpen(false)} onSaved={reload} />
            )}
        </div>
    );
}
