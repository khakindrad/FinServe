import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AddCityDialog({ open, onClose, onSaved }) {
  const [cityName, setCityName] = useState("");

  const [stateId, setStateId] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [stateModal, setStateModal] = useState(false);

  const { toast } = useToast();

  async function handleSave() {
    if (!cityName || !stateId) {
      toast({
        title: "Missing Fields",
        description: "City name and state are required.",
        variant: "destructive",
      });
      return;
    }

    await api.addCity({
      name: cityName,
      stateId,
    });

    toast({
      title: "City Added",
      description: `${cityName} has been added successfully.`,
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
          <h2 className="text-lg font-semibold">Add City</h2>

          {/* CITY NAME */}
          <Input
            placeholder="Enter City Name"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
          />

          {/* STATE SELECT */}
          <div className="relative">
            <Input
              placeholder="Select State"
              value={selectedStateName}
              readOnly
              className="pr-10 cursor-pointer"
              onClick={() => setStateModal(true)}
            />
            <button
              type="button"
              onClick={() => setStateModal(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              🔍
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-blue-600" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* STATE MODAL */}
      <SelectStateDialog
        open={stateModal}
        onClose={() => setStateModal(false)}
        onSelect={(state) => {
          setStateId(state.id);
          setSelectedStateName(state.name);
        }}
      />
    </>
  );
}


/* STATE SELECT MODAL */
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
          placeholder="Search state…"
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
              <span className="text-sm text-gray-500">{state.code ?? ""}</span>
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
