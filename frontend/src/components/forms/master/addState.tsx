import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AddStateDialog({ open, onClose, onSaved }) {
    const [name, setName] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [countryId, setcountryId] = useState("");
    const [countryModal, setCountryModal] = useState(false);

    const { toast } = useToast();

    async function handleSave() {
        await api.addStates({ name, countryId });
        toast({
            title: "State Added",
            description: `${name} has been added successfully.`,
        });

        onSaved();
        onClose();
    }

    if (!open) return null;

    return (
        <>
            {/* MAIN DIALOG */}
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                <div className="bg-white w-96 rounded-xl shadow-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Add State</h2>

                    <Input
                        placeholder="Enter State Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {/* <Input
                        placeholder="Enter State Code"
                        value={isoCode}
                        onChange={(e) => setIsoCode(e.target.value)}
                    /> */}

                    {/* COUNTRY INPUT with SEARCH ICON */}
                    <div className="relative">
                        <Input
                            placeholder="Select Country"
                            value={countryId}
                            readOnly
                            className="pr-10 cursor-pointer"
                            onClick={() => setCountryModal(true)}
                        />

                        <button
                            type="button"
                            onClick={() => setCountryModal(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                        >
                            🔍
                        </button>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button className="bg-blue-600" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
            {/* COUNTRY SELECTION MODAL */}
            <SelectCountryDialog
                open={countryModal}
                onClose={() => setCountryModal(false)}
                onSelect={(country) => setcountryId(country.id)}
            />
        </>
    );
}



/* COUNTRY SELECT MODAL COMPONENT */
function SelectCountryDialog({ open, onClose, onSelect }) {
    const [countries, setCountries] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.GetCountry().then((res) => setCountries(res.data || []));
    }, []);

    if (!open) return null;

    const filtered = countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white w-96 max-h-[400px] rounded-xl shadow-lg p-6 space-y-4 overflow-y-auto">
                <h2 className="text-lg font-semibold">Select Country</h2>

                <Input
                    placeholder="Search country…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="space-y-2 mt-2">
                    {filtered.map((country) => (
                        <div
                            key={country.id}
                            className="p-3 border rounded-lg hover:bg-gray-100 cursor-pointer flex justify-between"
                            onClick={() => {
                                onSelect(country);
                                onClose();
                            }}
                        >
                            <span className="font-medium">{country.name}</span>
                            <span className="text-sm text-gray-500">
                                {country.code ??
                                    country.mobileCode ??
                                    country.isoCode ??
                                    ""}
                            </span>
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
