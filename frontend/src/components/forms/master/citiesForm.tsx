"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCities } from "@/hooks/useCities";
import { exportToExcel } from "@/lib/exportExcel";
import AppAlert from "@/components/common/AppAlert";
import { api } from "@/lib/api";

import { Search, Plus, FileSpreadsheet } from "lucide-react";

export default function CityPage() {
    const { toast } = useToast();
    const { cities, loading, reload } = useCities();

    // Search + Pagination
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const filtered = useMemo(() => {
        return cities.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [cities, search]);

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    // FORM STATES
    const [showForm, setShowForm] = useState(false);
    const [name, setCityName] = useState("");
    const [stateId, setStateId] = useState("");
    const [selectedStateName, setSelectedStateName] = useState("");

    const [stateModal, setStateModal] = useState(false);

    // ALERTS
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // SUBMIT LOGIC (same as AddCityDialog)
    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        api
            .addCity({ name, stateId })
            .then(() => {
                setSuccessMsg("City added successfully!");
                reload();
                setShowForm(false);
                resetForm();
            })
            .catch((err) => {
                setErrorMsg(err.message || "Failed to add city");
            });
    }

    function resetForm() {
        setCityName("");
        setStateId("");
        setSelectedStateName("");
    }

    // Auto-clear alerts
    useEffect(() => {
        if (errorMsg || successMsg) {
            const timer = setTimeout(() => {
                setErrorMsg("");
                setSuccessMsg("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg, successMsg]);
    const TableSkeleton = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-28" />
            </div>

            <div className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4 p-3 border-b">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-32 justify-self-end" />
                    </div>
                ))}
            </div>
        </div>
    );
    // Skeleton
    // if (loading) return <CitySkeleton />;
    return (
        <div className="p-6 w-full">
            <Card className="w-full shadow-md border rounded-xl">


                <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-2xl">City Management</CardTitle>
                </CardHeader>

                <CardContent>
                    {errorMsg && <AppAlert type="error" message={errorMsg} />}
                    {successMsg && <AppAlert type="success" message={successMsg} />}

                    {/* TOP BAR */}
                    {!showForm && (
                        <div className="flex justify-between items-center mb-6">
                            {/* Search Box with Icon */}
                            <div className="relative max-w-xs">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search state..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>


                            <div className="flex gap-3">
                                <Button
                                    onClick={() => exportToExcel(cities, "Cities")}
                                    className="bg-black hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <FileSpreadsheet size={18} />
                                    Export Excel
                                </Button>

                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="bg-blue-600 flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add City
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* FORM SECTION */}
                    {showForm && (
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg border">
                            <h2 className="text-xl font-semibold mb-4">Add City</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* CITY NAME */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setCityName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* STATE SELECTOR */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select State</label>

                                    <div className="relative">
                                        <Input
                                            value={selectedStateName}
                                            readOnly
                                            className="cursor-pointer pr-10"
                                            placeholder="Select State"
                                            onClick={() => setStateModal(true)}
                                        />

                                        {/* Lucide Search Icon */}
                                        <Search
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-800"
                                            size={18}
                                            onClick={() => setStateModal(true)}
                                        />
                                    </div>
                                </div>

                                {/* BUTTONS */}
                                <div className="flex justify-end gap-3">
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
                                        Save City
                                    </Button>
                                </div>

                            </form>
                        </div>
                    )}

                    {/* TABLE SECTION */}
                    {!showForm && (loading ? <TableSkeleton /> : (
                        <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
                            <table className="min-w-[800px] w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">City</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-6 text-center text-gray-500 italic">
                                                No cities found
                                            </td>
                                        </tr>
                                    )}

                                    {paginated.map((c) => (
                                        <tr key={c.id} className="border-t hover:bg-gray-50 transition">
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
                    ))}

                </CardContent>

                {/* PAGINATION */}
                {!showForm && (
                    <CardFooter className="flex justify-between items-center p-4">
                        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                            Previous
                        </Button>

                        <p className="text-gray-600 font-medium">
                            Page {page} / {totalPages}
                        </p>

                        <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                            Next
                        </Button>
                    </CardFooter>
                )}

            </Card>

            {/* STATE SELECT MODAL */}
            <SelectStateDialog
                open={stateModal}
                onClose={() => setStateModal(false)}
                onSelect={(state) => {
                    setStateId(state.id);
                    setSelectedStateName(state.id);
                    setStateModal(false);
                }}
            />
        </div>
    );
}

function SelectStateDialog({ open, onClose, onSelect }) {
    const [states, setStates] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.GetAllState().then((res) => setStates(res.data || []));
    }, []);

    if (!open) return null;

    const filtered = states.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white w-96 max-h-[400px] rounded-xl shadow-lg p-6 space-y-4 overflow-y-auto">
                <h2 className="text-lg font-semibold">Select State</h2>

                <Input
                    placeholder="Search city…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="space-y-2 mt-2">
                    {filtered.map((state) => (
                        <div
                            key={state.id}
                            className="p-3 border rounded-lg hover:bg-gray-100 cursor-pointer flex justify-between"
                            onClick={() => {
                                onSelect(state);
                                onClose();
                            }}
                        >
                            <span className="font-medium">{state.name}</span>
                            <span className="text-sm text-gray-500">{state.id ?? ""}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
